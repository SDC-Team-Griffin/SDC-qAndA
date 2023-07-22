const db = require('../../db');

module.exports = {
  GET: async(req, res) => {
    const { product_id, page, count } = req.query;
    const offset = (page - 1) * count;

    const query = `
      WITH question_answers AS (
        SELECT
          q.id AS question_id,
          q.body AS question_body,
          q.date_written AS question_date,
          q.asker_name,
          q.helpful AS question_helpfulness,
          CASE
            WHEN q.reported = 1 THEN true
            ELSE false
          END AS reported,

          a.id AS answer_id,
          a.body AS answer_body,
          a.date_written AS answer_date,
          a.answerer_name,
          a.helpful AS answer_helpfulness,
          COALESCE(
            jsonb_agg(jsonb_build_object('id', ap.id, 'url', ap.url)),
            '[]'
          ) AS photos
        FROM
          questions AS q
        LEFT JOIN
          answers AS a ON q.id = a.question_id
        LEFT JOIN
          answers_photos AS ap ON a.id = ap.answer_id
        WHERE
          q.product_id = $1
        GROUP BY
          q.id, a.id
      )

      SELECT
        question_id,
        question_body,
        question_date,
        asker_name,
        question_helpfulness,
        reported,
        jsonb_agg(
          jsonb_build_object(
            'answer_id', answer_id,
            'body', answer_body,
            'date', answer_date,
            'answerer_name', answerer_name,
            'helpfulness', answer_helpfulness,
            'photos', photos
          )
        ) AS answers
      FROM
        question_answers
      GROUP BY
        question_id, question_body, question_date,
        asker_name, question_helpfulness, reported
      ORDER BY
        question_id
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await db.query(
        query, [ product_id, count, offset ]
      );
      const questions = result.rows;

      console.log(`${ questions.length } question(s) fetched!`);

      res.status(200).json({
        product_id,
        results: questions
      });

    } catch(err) {
      res.status(500).json({
        error: `Error fetching questions for product: ${ product_id }`
      });
    }
  },

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
      res.status(500).json({
        error: `Error reporting question: ${ question_id }`
      });
    }
  }
};
