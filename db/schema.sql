-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS questions CASCADE;
-- DROP TABLE IF EXISTS answers CASCADE;
-- DROP TABLE IF EXISTS answers_photos;

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

-- SYNC TABLES ID'S
SELECT setval(PG_GET_SERIAL_SEQUENCE('questions', 'id'), (SELECT MAX(id) FROM questions));
SELECT setval(PG_GET_SERIAL_SEQUENCE('answers', 'id'), (SELECT MAX(id) FROM answers));
SELECT setval(PG_GET_SERIAL_SEQUENCE('answers_photos', 'id'), (SELECT MAX(id) FROM answers_photos));

-- CONFIRM NEW ENTRIES
-- SELECT * FROM questions
-- WHERE id = (SELECT MAX(id) FROM questions);

-- SELECT * FROM answers
-- WHERE id = (SELECT MAX(id) FROM answers);