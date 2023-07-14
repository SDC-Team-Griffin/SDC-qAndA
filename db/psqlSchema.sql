DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS answers_photos;

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  slogan VARCHAR NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR NOT NULL,
  default_price INTEGER NOT NULL
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  date_written BIGINT NOT NULL,
  asker_name VARCHAR NOT NULL,
  asker_email VARCHAR NOT NULL,
  reported INTEGER NOT NULL DEFAULT 0,
  helpful INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL,
  body TEXT NOT NULL,
  date_written BIGINT NOT NULL,
  answerer_name VARCHAR NOT NULL,
  answerer_email VARCHAR NOT NULL,
  reported INTEGER NOT NULL DEFAULT 0,
  helpful INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE answers_photos (
  id SERIAL PRIMARY KEY,
  answer_id INTEGER NOT NULL,
  url VARCHAR NOT NULL
);

COPY products
FROM '/Users/boss/Documents/HACK REACTOR/SYSTEMS DESIGN CAPSTONE/SDC-qAndA/csv/product.csv'
DELIMITER ',' CSV HEADER;

ALTER TABLE questions
ADD FOREIGN KEY (product_id)
REFERENCES products (id);

COPY questions
FROM '/Users/boss/Documents/HACK REACTOR/SYSTEMS DESIGN CAPSTONE/SDC-qAndA/csv/questions.csv'
DELIMITER ',' CSV HEADER;

ALTER TABLE answers
ADD FOREIGN KEY (question_id)
REFERENCES questions (id);

COPY answers
FROM '/Users/boss/Documents/HACK REACTOR/SYSTEMS DESIGN CAPSTONE/SDC-qAndA/csv/answers.csv'
DELIMITER ',' CSV HEADER;

ALTER TABLE answers_photos
ADD FOREIGN KEY (answer_id)
REFERENCES answers (id);

COPY answers_photos
FROM '/Users/boss/Documents/HACK REACTOR/SYSTEMS DESIGN CAPSTONE/SDC-qAndA/csv/answers_photos.csv'
DELIMITER ',' CSV HEADER;