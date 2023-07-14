-- TABLES --
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  body TEXT,
  date_written TIMESTAMP NOT NULL DEFAULT now(),
  asker_name VARCHAR NOT NULL,
  asker_email VARCHAR NOT NULL,
  reported INTEGER NOT NULL DEFAULT 0,
  helpful INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL,
  body TEXT,
  date_written TIMESTAMP NOT NULL DEFAULT now(),
  answerer_name VARCHAR NOT NULL,
  answerer_email VARCHAR NOT NULL,
  reported INTEGER NOT NULL DEFAULT 0,
  helpful INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS answers_photos (
  id SERIAL PRIMARY KEY,
  answer_id INTEGER NOT NULL,
  url VARCHAR NOT NULL
);

-- FOREIGN KEYS --
ALTER TABLE questions
ADD FOREIGN KEY (product_id)
REFERENCES products (id);

ALTER TABLE answers
ADD FOREIGN KEY (question_id)
REFERENCES questions (id);

ALTER TABLE answers_photos
ADD FOREIGN KEY (answer_id)
REFERENCES answers (id);

-- IMPORT DATA --
COPY questions (product_id, body, date_written, asker_name, asker_email, reported, helpful)
FROM '../csv/questions.csv'
DELIMITER ',' CSV HEADER;

COPY answers (question_id, body, date_written, answerer_name, answerer_email, reported, helpful)
FROM '../csv/answers.csv'
DELIMITER ',' CSV HEADER;

COPY products (name)
FROM '../csv/product.csv'
DELIMITER ',' CSV HEADER;

COPY answers_photos (answer_id, url)
FROM '../csv/answers_photos.csv'
DELIMITER ',' CSV HEADER;