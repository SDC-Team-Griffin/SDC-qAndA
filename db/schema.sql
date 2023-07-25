-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS questions CASCADE;
-- DROP TABLE IF EXISTS answers CASCADE;
-- DROP TABLE IF EXISTS answers_photos CASCADE;

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  slogan VARCHAR NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR NOT NULL,
  default_price INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  date_written BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP),
  asker_name VARCHAR NOT NULL,
  asker_email VARCHAR NOT NULL,
  reported INTEGER NOT NULL DEFAULT 0,
  helpful INTEGER NOT NULL DEFAULT 0,

  FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE TABLE IF NOT EXISTS answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  date_written BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP),
  answerer_name VARCHAR NOT NULL,
  answerer_email VARCHAR NOT NULL,
  reported INTEGER NOT NULL DEFAULT 0,
  helpful INTEGER NOT NULL DEFAULT 0,

  FOREIGN KEY (question_id) REFERENCES questions (id)
);

CREATE TABLE IF NOT EXISTS answers_photos (
  id SERIAL PRIMARY KEY,
  answer_id INTEGER NOT NULL,
  url VARCHAR NOT NULL,

  FOREIGN KEY (answer_id) REFERENCES answers (id)
);

/*
-- IMPORT DATA
COPY products
FROM '/Users/boss/Documents/HACK REACTOR/SYSTEMS DESIGN CAPSTONE/SDC-qAndA/csv/product.csv'
DELIMITER ',' CSV HEADER;

COPY questions
FROM '/Users/boss/Documents/HACK REACTOR/SYSTEMS DESIGN CAPSTONE/SDC-qAndA/csv/questions.csv'
DELIMITER ',' CSV HEADER;

COPY answers
FROM '/Users/boss/Documents/HACK REACTOR/SYSTEMS DESIGN CAPSTONE/SDC-qAndA/csv/answers.csv'
DELIMITER ',' CSV HEADER;

COPY answers_photos
FROM '/Users/boss/Documents/HACK REACTOR/SYSTEMS DESIGN CAPSTONE/SDC-qAndA/csv/answers_photos.csv'
DELIMITER ',' CSV HEADER;
*/

-- SYNC TABLES ID'S
SELECT setval(
  PG_GET_SERIAL_SEQUENCE('questions', 'id'),
  (SELECT MAX(id) FROM questions)
);
SELECT setval(
  PG_GET_SERIAL_SEQUENCE('answers', 'id'),
  (SELECT MAX(id) FROM answers)
);
SELECT setval(
  PG_GET_SERIAL_SEQUENCE('answers_photos', 'id'),
  (SELECT MAX(id) FROM answers_photos)
);

-- CONFIRM NEW ENTRIES
-- SELECT * FROM questions
-- WHERE id = (SELECT MAX(id) FROM questions);

-- SELECT * FROM answers
-- WHERE id = (SELECT MAX(id) FROM answers);

-- NO INDEX (COMPARE QUERY PERFORMANCE)
-- DROP INDEX IF EXISTS idx_products_id;
-- DROP INDEX IF EXISTS idx_questions_id;
-- DROP INDEX IF EXISTS idx_answers_id;
-- DROP INDEX IF EXISTS idx_answers_photos_id;

-- DROP INDEX IF EXISTS idx_q_products_id ON questions (product_id);
-- DROP INDEX IF EXISTS idx_a_questions_id ON answers (question_id);
-- DROP INDEX IF EXISTS idx_ap_answers_id ON answers_photos (answer_id);

-- INDEX PRIMARY ID COLUMNS
CREATE INDEX idx_products_id ON products (id);
CREATE INDEX idx_questions_id ON questions (id);
CREATE INDEX idx_answers_id ON answers (id);
CREATE INDEX idx_answers_photos_id ON answers_photos (id);

-- INDEX FOREIGN ID COLUMNS
CREATE INDEX idx_q_products_id ON questions (product_id);
CREATE INDEX idx_a_questions_id ON answers (question_id);
CREATE INDEX idx_ap_answers_id ON answers_photos (answer_id);

-- QUERY TOP, MID, BOTTOM 10% OF DATA
SELECT * FROM questions
ORDER BY id
LIMIT (SELECT COUNT(*) * 0.1 FROM questions);

SELECT * FROM questions
ORDER BY id
OFFSET (SELECT COUNT(*) * 0.45 FROM questions)
LIMIT (SELECT COUNT(*) * 0.1 FROM questions);

SELECT * FROM questions
ORDER BY id DESC
LIMIT (SELECT COUNT(*) * 0.1 FROM questions);
