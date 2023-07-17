const db = require('../db');
// const { sequelize, QueryTypes } = require('../db/db.js');

module.exports = {

  questions: {

    GET: async(req, res) => {
      const { product_id, page, count } = req.query;

      // OFFSET = rows to skip
      const offset = (page - 1) * count;

      // parameterized query (w/ placeholders)
      const questionsQuery = `
        SELECT * FROM questions
        WHERE product_id = $1
        ORDER BY id
        LIMIT $2 OFFSET $3
      `;
      const questionParams = [ product_id, count, offset ];

      try {
        const questionsResult = await db.query(questionsQuery, questionParams);

        const answersQuery = `
          SELECT * FROM answers
          WHERE question_id IN (SELECT id FROM questions WHERE product_id = $1)
        `;

        const answersResult = await db.query(answersQuery, [ product_id ]);

        // returns array for each row by default
        const questions = questionsResult.rows.map((question) => {
          const { id, body, date_written, asker_name, helpful, reported } = question;

          const formatted = {
            question_id: id,
            question_body: body,
            question_date: new Date(Number(date_written)).toISOString(),
            asker_name: asker_name,
            question_helpfulness: helpful,
            reported: reported === 1,
            answers: {}
          };

          // only corresponding questions
          const answers = answersResult.rows.filter(
            (answer) => answer.question_id === question_id
          );

          answers.forEach((answer) => {
            const { id, body, date_written, answerer_name, answerer_email, helpful, photos } = answer;

            formatted.answers[ id ] = {
              id: id,
              body: body,
              date: new Date(Number(date_written)).toISOString(),
              answerer_name: answerer_name,
              answerer_email: answerer_email,

            }
          })
        });

        // if no questions found
        if (questions.length === 0) {
          res.status(404).json({ error: `No questions for product: ${ product_id }` });
        }

        // else return questions
        console.log('Questions fetched successfully!');
        res.status(200).json({ data: questions });

      } catch(err) {
        console.error(`Error fetching questions: ${ err }`);

        res.status(500).json({ error: 'Error fetching questions' });
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
        await db.query(strQuery, [ question_id ]);

        return res.status(200).json({
          success: true,
          message: 'Helpfulness updated (+1)!'
        });

      } catch(err) {
        res.status(500).json({ error: `Error upvoting question: ${ question_id }` });
      }
    },

    REPORT: async(req, res) => {
      const { question_id } = req.params;

      const strQuery = `
        UPDATE questions
        SET reported = 1;
        WHERE id = $1
      `;

      try {
        await db.query(strQuery, [ question_id ]);

        res.status(204).json({ success: true, message: 'Question reported!' });

      } catch(err) {
        res.status(500).json({ error: `Error reporting question: ${ question_id }` });
      }
    },

    // "SequelizeUniqueConstraintError: Validation error" **
    // "duplicate key value violates unique constraint 'questions_pkey'"
    POST: async(req, res) => {
      const { product_id, body, name, email } = req.body;

      const strQuery = `
        INSERT INTO questions (product_id, body, asker_name, asker_email)
        VALUES ($1, $2, $3, $4)
      `;
      const params = [ product_id, body, name, email ];

      try {
        await db.query(strQuery, params);
        console.log(`${ name } posted question: ${ body }`);

        res.status(201).json({
          success: true,
          message: 'Question posted!'
        });

      } catch(err) {
        console.error(`Error posting question: ${ err }`);

        res.status(500).json({ error: 'Error posting question' });
      }
    }
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
        console.error(`Error fetching answers: ${ err }`);

        res.status(500).json({ error: 'Error fetching answers!' });
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
        await db.query(strQuery, [ answer_id ]);

        return res.status(200).json({
          success: true,
          message: 'Helpfulness updated (+1)!'
        });

      } catch(err) {
        res.status(500).json({ error: `Error upvoting answer: ${ answer_id }` });
      }
    },

    REPORT: async(req, res) => {
      const { answer_id } = req.params;

      const strQuery = `
        UPDATE answers
        SET reported = 1;
        WHERE id = $1
      `;

      try {
        await db.query(strQuery, [ answer_id ]);

        res.status(204).json({ success: true, message: 'Answer reported!' });

      } catch(err) {
        res.status(500).json({ error: `Error reporting question: ${ answer_id }` });
      }
    },

    POST: async(req, res) => {
      const { question_id } = req.params;
      const { body, name, email, photos } = req.body;

      const answerQuery = `
        INSERT INTO answers (question_id, body, answerer_name, answerer_email)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
      `;
      const answerParams = [ question_id, body, name, email ];

      try {
        const answerResult = await db.query(answerQuery, answerParams);
        const answer_id = answerResult.rows[0].id;

        if (photos.length > 0) {
          const photoQuery = `
            INSERT INTO answers_photos (answer_id, url)
            VALUES ${ photos.map((url) => '($1, $2)').join(',') }
          `;

          const photoValues = photos.flatMap((url) => [ answer_id, url ]);
          await db.query(photoQuery, photos);

          console.log(`${ name } posted answer: ${ body } + ${ photoValues.length } photo(s)!`);

          return res.status(201).json({
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

      /*
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
      */
    }
  }
};