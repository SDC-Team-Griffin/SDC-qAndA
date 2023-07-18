const db = require('../../db');

module.exports = {
  GET: async(req, res) => {
    const { question_id } = req.params;
    const { page, count } = req.query;

    const offset = (page - 1) * count;

    /*
    const strQuery = `
      SELECT * FROM answers
      WHERE question_id = $1
      ORDER BY id
      LIMIT $2 OFFSET $3
    `;
    */

    /*
      LEFT JOIN:
        > ALL rows from LEFT table included in data set
        > joins w/ column names (in condition) from RIGHT table
        > sets val of every column from RIGHT table to NULL if unmatched

      json_agg:
        > aggregates multiple rows of data into single JSON array

      json_build_object:
        > constructs JSON obj using key-val pairs

      COALESCE:
        > designates default val when result === null
        (e.g. when answer has no photos —> empty array)

        > takes multiple args —> returns 1st non-null
    */
    const strQuery = `
      SELECT
        a.id AS answer_id,
        a.body,
        a.date_written AS date,
        a.answerer_name,
        a.helpful AS helpfulness,
        COALESCE(
          jsonb_agg(jsonb_build_object('id', ap.id, 'url', ap.url)),
          '[]'
        ) AS photos
      FROM
        answers AS a
      LEFT JOIN
        answers_photos AS ap ON a.id = ap.answer_id
      WHERE
        a.question_id = $1
      GROUP BY
        a.id
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await db.query(
        strQuery, [ question_id, count, offset ]
      );
      const answers = result.rows;

      console.log(`${ answers.length } answer(s) fetched!`);

      res.status(200).json({
        question: question_id,
        page: parseInt(page),
        count: parseInt(count),
        results: answers
      });

    } catch(err) {
      console.error(`Error fetching answers: ${ err }`);

      res.status(500).json({
        error: `Error fetching answers for question: ${ question_id }`
      });
    }
  },

  /* (errors):
    > "SequelizeUniqueConstraintError: Validation error"
    > "duplicate key value violates unique constraint 'answers_pkey'"

    > NOTE: needed to sync table ID sequences (in schema)! **
  */
  POST: async(req, res) => {
    const { question_id } = req.params;
    const { body, name, email, photos } = req.body;

    const answerQuery = `
      INSERT INTO answers (question_id, body, answerer_name, answerer_email)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;

    try {
      const result = await db.query(
        answerQuery, // NOTE: returns ID
        [ question_id, body, name, email ]
      );

      const answerID = result.rows[0].id;

      // check for photos
      if (photos.length > 0) {
        const photoQuery = `
          INSERT INTO answers_photos (answer_id, url)
          VALUES ${ photos.map((url) => '($1, $2)').join(',') }
        `;

        const photoVals = photos.flatMap(
          (url) => [ answerID, url ]
        );

        await db.query(
          photoQuery, photoVals
        );

        console.log(`${ name } posted answer + ${ photoVals.length } photo(s)!`);

        res.status(201).json({
          success: true,
          message: `Answer + Photo(s) posted!`
        });
      }

      console.log(`${ name } posted answer: ${ body }`);

      res.status(201).json({
        success: true,
        message: 'Answer posted!'
      });

    } catch(err) {
      console.error(`Error posting answer: ${ err }`);

      res.status(500).json({ error: 'Error posting answer!' });
    }
  },

  UPVOTE: async(req, res) => {
    const { answer_id } = req.params;

    const strQuery = `
      UPDATE answers
      SET helpful = helpful + 1
      WHERE id = $1
    `;

    try {
      await db.query(
        strQuery, [ answer_id ]
      );

      console.log('Helpfulness updated (+1)!');

      res.status(204).end();

    } catch(err) {
      console.error(`Error upvoting answer: ${ err }`);

      res.status(500).json({
        error: `Error upvoting answer: ${ answer_id }`
      });
    }
  },

  REPORT: async(req, res) => {
    const { answer_id } = req.params;

    const strQuery = `
      UPDATE answers
      SET reported = 1
      WHERE id = $1
    `;

    try {
      await db.query(
        strQuery, [ answer_id ]
      );

      console.log('Answer reported!');

      res.status(204).end();

    } catch(err) {
      console.error(`Error reporting answer: ${ err }`);

      res.status(500).json({
        error: `Error reporting answer: ${ answer_id }`
      });
    }
  }
};