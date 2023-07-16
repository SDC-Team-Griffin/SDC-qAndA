const db = require('../db');
// const { sequelize, QueryTypes } = require('../db/db.js');

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
        LIMIT $2
        OFFSET $3
      `;
      const params = [ product_id, count, offset ];

      try {
        const result = await db.query(strQuery, params);

        // returns array for each row by default
        const questions = result.rows;

        // if no questions found
        if (questions.length === 0) {
          console.error(`No questions for product_id: ${ product_id }`);

          res.status(404).json({ error: 'No questions found!' });
        }

        // else return questions
        console.log('Questions fetched successfully!');
        res.status(200).json(questions);

      } catch(err) {
        console.error(`Error fetching questions: ${ err }`);

        res.status(500).json({ error: 'Error fetching questions' });
      }
    },

    // "SequelizeUniqueConstraintError: Validation error" **
    POST: (req, res) => {
      const { product_id, body, name, email } = req.body;
      console.log(`product_id: ${ product_id }, body: ${ body }, name: ${ name }, email: ${ email }`);

      const strQuery = `
        INSERT INTO questions (product_id, body, asker_name, asker_email)
        VALUES ($1, $2, $3, $4)
      `;

      sequelize
        .query(strQuery, {
          type: QueryTypes.INSERT,
          bind: [ product_id, body, name, email ],
          raw: true // NOTE: no model for query
        })
        .then(() => {
          res.status(201).json({
            success: true,
            message: 'Question posted!'
          });
        })
        .catch((err) => {
          res.status(500).json({ error: `Error posting question: ${ err }` });
        });
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
        LIMIT $2
        OFFSET $3
      `;
      const params = [ question_id, count, offset ];

      try {
        const result = await db.query(strQuery, params);

        // returns array for each row by default
        const answers = result.rows;

        // if no answers found
        if (answers.length === 0) {
          console.error(`No answers for question_id: ${ question_id }`);

          res.status(404).json({ error: 'No answers found!' });
        }

        // else return answers
        console.log('Answers fetched successfully!');
        res.status(200).json(answers);

      } catch(err) {
        console.error(`Error fetching questions: ${ err }`);

        res.status(500).json({ error: 'Error fetching questions!' });
      }
    },

    // "SequelizeUniqueConstraintError: Validation error" **
    POST: (req, res) => {
      const { question_id } = req.params;
      const { body, name, email, photos } = req.body;

      const strQuery = `
        INSERT INTO answers (question_id, body, answerer_name, answerer_email)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `;

      sequelize
        .query(strQuery, {
          type: QueryTypes.INSERT,
          bind: [ question_id, body, name, email ],
          raw: true
        })
        .then((result) => {
          const answer_id = result[0].id;

          if (photos.length > 0) {
            const photos = photos.map((url) => [ answer_id, url ]);

            const photoQuery = `
              INSERT INTO answers_photos (answer_id, url)
              VALUES ${ photos.map((photo) => `(${ answer_id }, '${ photo }')`).join(',') }
            `;

            (async() => {
              try {
                await sequelize.query(photoQuery);

                res.status(201).json({
                  success: true,
                  message: 'Photo(s) posted!'
                });
              } catch(err) {
                res.status(500).json({ error: `Error posting photo(s): ${ err }` });
              }
            })();

          } else {
            res.status(201).json({
              success: true,
              message: 'Answer posted!'
            });
          }
        })
        .catch((err) => {
          res.status(500).json({ error: `Error posting answer: ${ err }` });
        });
    }
  }
};
