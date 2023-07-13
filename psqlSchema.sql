-- TABLES --
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  body TEXT,
  date_written TIMESTAMP NOT NULL DEFAULT now(),
  asker_name VARCHAR NOT NULL,
  asker_email VARCHAR NOT NULL,
  reported INTEGER NOT NULL DEFAULT 0,
  helpful INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL,
  body TEXT,
  date_written TIMESTAMP NOT NULL DEFAULT now(),
  answerer_name VARCHAR NOT NULL,
  answerer_email VARCHAR NOT NULL,
  reported INTEGER NOT NULL DEFAULT 0,
  helpful INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL
);

CREATE TABLE answers_photos (
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