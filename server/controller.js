const { sequelize, QueryTypes } = require('../db/db.js');

module.exports = {

  questions: {

    GET: (req, res) => {
      const { product_id, page, count } = req.query;
      const offset = (page - 1) * count;

      const strQuery = `
        SELECT * FROM questions
        WHERE product_id = ${ product_id }
        ORDER BY id
        LIMIT ${ count }
        OFFSET ${ offset }
      `;

      sequelize
        .query(strQuery, { type: QueryTypes.SELECT })
        .then((questions) => {
          console.log('Question(s) fetched!');

          res.json(questions);
        })
        .catch((err) => {
          res.status(500).json({ error: `Error fetching questions: ${ err }` });
        });
    },

    POST: (req, res) => {
      const { product_id, body, name, email } = req.body;
      // console.log(`product_id: ${ product_id }, body: ${ body }, name: ${ name }, email: ${ email }`);

      const strQuery = `
        INSERT INTO questions (product_id, body, asker_name, asker_email)
        VALUES ($1, $2, $3, $4)
      `;

      // "SequelizeUniqueConstraintError: Validation error"

      // NOTE: consider validating before INSERT **

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

    GET: (req, res) => {
      const { question_id } = req.params;
      const { page, count } = req.query;

      const offset = (page - 1) * count;

      const strQuery = `
        SELECT * FROM answers
        WHERE question_id = ${ question_id }
        ORDER BY id
        LIMIT ${ count }
        OFFSET ${ offset }
      `;

      sequelize
        .query(strQuery, { type: QueryTypes.SELECT })
        .then((answers) => {
          console.log('Answer(s) fetched!');

          res.json(answers);
        })
        .catch((err) => {
          res.status(500).json({ error: `Error fetching answers: ${ err }` });
        });
    },

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

          if (Array.isArray(photos) && photos.length > 0) {
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
