const db = require('../../db');

module.exports = {
  GET: async(req, res) => {
    const { product_id, page, count } = req.query;
    const offset = (page - 1) * count;

    /* parameterized query (w/ placeholders)
    const strQuery = `
      SELECT * FROM questions
      WHERE product_id = $1
      ORDER BY id
      LIMIT $2 OFFSET $3
    `;
    */

    const queryQ = `
      SELECT
        q.id AS question_id,
        q.body AS question_body,
        q.date_written AS question_date,
        q.asker_name,
        q.helpful AS question_helpfulness,
        q.reported
      FROM
        questions AS q
      WHERE
        q.product_id = $1
      ORDER BY
        q.id
      LIMIT $2 OFFSET $3
    `;

    try {
      const resultQ = await db.query(
        queryQ, [ product_id, count, offset ]
      );
      // NOTE: must retrieve in separate steps (due to async nature) **
      const questions = resultQ.rows;

      console.log(`${ questions.length } question(s) fetched!`);

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
      await Promise.all(
        questions.map(async(question) => {
          const queryA = `
            SELECT
              a.id AS answer_id,
              a.body,
              a.date_written AS date,
              a.answerer_name,
              a.helpful AS helpfulness,
              COALESCE(
                json_agg(json_build_object('id', ap.id, 'url', ap.url)),
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
          `;

        const resultA = await db.query(
          queryA, [ question.question_id ]
        );
        question.answers = resultA.rows;
      })
    );

      res.status(200).json({
        product_id,
        results: questions
      });

    } catch(err) {
      console.error(`Error fetching questions: ${ err }`);

      res.status(500).json({
        error: `Error fetching questions for product: ${ product_id }`
      });
    }
  },

  /* (errors):
    > "SequelizeUniqueConstraintError: Validation error" **
    > "duplicate key value violates unique constraint 'questions_pkey'"

    > NOTE: needed to sync table ID sequences (in schema)! **
  */
  POST: async(req, res) => {
    const { product_id, body, name, email } = req.body;

    const strQuery = `
      INSERT INTO questions (product_id, body, asker_name, asker_email)
      VALUES ($1, $2, $3, $4)
    `;

    try {
      await db.query(
        strQuery, [ product_id, body, name, email ]
      );

      console.log(`${ name } posted question: ${ body }`);

      res.status(201).json({
        success: true,
        message: 'Question posted!'
      });

    } catch(err) {
      console.error(`Error posting question: ${ err }`);

      res.status(500).json({
        error: `Error posting question: ${ body }`
      });
    }
  },

  UPVOTE: async(req, res) => {
    const { question_id } = req.params;

    const strQuery = `
      UPDATE questions
      SET helpful = helpful + 1
      WHERE id = $1
    `;

    try {
      await db.query(
        strQuery, [ question_id ]
      );

      console.log('Helpfulness updated (+1)!');

      res.status(204).end();

    } catch(err) {
      console.error(`Error upvoting question: ${ err }`);

      res.status(500).json({
        error: `Error upvoting question: ${ question_id }`
      });
    }
  },

  REPORT: async(req, res) => {
    const { question_id } = req.params;

    const strQuery = `
      UPDATE questions
      SET reported = 1
      WHERE id = $1
    `;

    try {
      await db.query(
        strQuery, [ question_id ]
      );

      console.log('Question reported!');

      res.status(204).end();

    } catch(err) {
      console.error(`Error reporting question: ${ err }`);

      res.status(500).json({
        error: `Error reporting question: ${ question_id }`
      });
    }
  }
};