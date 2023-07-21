/*
GET: async(req, res) => {
  const { product_id, page, count } = req.query;
  const offset = (page - 1) * count;

  const queryQ = `
    SELECT
      q.id AS question_id,
      q.body AS question_body,
      q.date_written AS question_date,
      q.asker_name,
      q.helpful AS question_helpfulness,
      CASE
        WHEN q.reported = 1 THEN true
        ELSE false
      END AS reported
    FROM
      questions AS q
    WHERE
      q.product_id = $1
    ORDER BY
      q.id
    LIMIT $2 OFFSET $3
  `;

  try {
    const resultQ = await db.query(queryQ, [ product_id, count, offset ]);
    const questions = resultQ.rows;

    console.log(`${ questions.length } question(s) fetched!`);

    for (const question of questions) {
      const queryA = `
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
      `;

      const resultA = await db.query(queryA, [ question.question_id ]);
      question.answers = resultA.rows;
    }

    res.status(200).json({
      product_id,
      results: questions,
    });

  } catch(err) {
    res.status(500).json({
      error: `Error fetching questions for product: ${ product_id }`
    });
  }
},
*/