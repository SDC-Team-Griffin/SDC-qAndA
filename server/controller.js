const db = require('../db');

module.exports = {

  questions: {

    GET: async(req, res) => {
      const { product_id, page, count } = req.query;
      const offset = (page - 1) * count;

      // parameterized query (w/ placeholders)
      const strQuery = `
        SELECT * FROM questions
        WHERE product_id = $1
        ORDER BY id
        LIMIT $2 OFFSET $3
      `;

      try {
        const result = await db.query(
          strQuery, [ product_id, count, offset ]
        );
        // NOTE: must retrieve in separate steps (due to async nature) **
        const questions = result.rows;

        console.log(`${ questions.length } question(s) fetched!`);

        res.status(200).json(questions);

      } catch(err) {
        console.error(`Error fetching questions: ${ err }`);

        res.status(500).json({
          error: `Error fetching questions for product: ${ product_id }`
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

  },

  answers: {

    GET: async(req, res) => {
      const { question_id } = req.params;
      const { page, count } = req.query;

      const offset = (page - 1) * count;

      const strQuery = `
        SELECT * FROM answers
        WHERE question_id = $1
        ORDER BY id
        LIMIT $2 OFFSET $3
      `;

      try {
        const result = await db.query(
          strQuery, [ question_id, count, offset ]
        );
        const answers = result.rows;

        console.log(`${ answers.length } answer(s) fetched!`);

        res.status(200).json(answers);

      } catch(err) {
        console.error(`Error fetching answers: ${ err }`);

        res.status(500).json({
          error: `Error fetching answers for question: ${ question_id }`
        });
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
    },

    // SYNC TABLE ID'S FIRST **
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
    }

  }
};