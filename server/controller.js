const { sequelize, QueryTypes } = require('../db/db.js');

module.exports = {

  getQuestions: (req, res) => {
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
        console.log('Questions fetched successfully!');

        res.json(questions);
      })
      .catch((err) => {
        res.status(500).json({ error: `Error fetching questions: ${ err }` });
      });
  },

  postQuestions: (req, res) => {
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
        bind: [ product_id, body, name, email ]
      })
      .then(() => {
        res.status(201).json({
          success: true,
          message: 'Question posted successfully!'
        });
      })
      .catch((err) => {
        res.status(500).json({ error: `Error posting question: ${ err }` });
      });
  },

  getAnswers: (req, res) => {
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
        console.log('Answers fetched successfully!');

        res.json(answers);
      })
      .catch((err) => {
        res.status(500).json({ error: `Error fetching answers: ${ err }` });
      });
  }

};
