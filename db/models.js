require('dotenv').config();
const { USER, DB } = process.env;
const fs = require('fs');
const path = require('path');

const csv = require('csv-parser'); // CSV parsing library **

const { Sequelize, DataTypes } = require('sequelize');
const connectionString = `postgres://${ USER }@localhost:5432/${ DB }`;
const sequelize = new Sequelize(connectionString);

// MODELS
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  body: {
    type: DataTypes.TEXT
  },
  date_written: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  asker_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  asker_email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reported: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  helpful: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
});

const Answer = sequelize.define('Answer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  body: {
    type: DataTypes.TEXT
  },
  date_written: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  answerer_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  answerer_email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reported: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  helpful: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
});

const AnswerPhoto = sequelize.define('AnswerPhoto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  answer_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// ASSOCIATIONS
Product.hasMany(Question, { foreignKey: 'product_id' });
Question.belongsTo(Product, { foreignKey: 'product_id' });

Question.hasMany(Answer, { foreignKey: 'question_id' });
Answer.belongsTo(Question, { foreignKey: 'question_id' });

Answer.hasMany(AnswerPhoto, { foreignKey: 'answer_id' });
AnswerPhoto.belongsTo(Answer, { foreignKey: 'answer_id' });

// NOTE: must process in chunks (too big for Sequelize)
const questionStream = fs.createReadStream(
  path.join(__dirname, '../csv/questions.csv'),
  'utf-8'
);
const answerStream = fs.createReadStream(
  path.join(__dirname, '../csv/answers.csv'),
  'utf-8'
);
const productStream = fs.createReadStream(
  path.join(__dirname, '../csv/product.csv'),
  'utf-8'
);
const photoStream = fs.createReadStream(
  path.join(__dirname, '../csv/answers_photos.csv'),
  'utf-8'
);

const importData = [];

const parseCSV = (stream, model, attributes) => {
  return new Promise((resolve, reject) => {
    const chunks = [];

    stream
      .pipe(csv()) // stream —> csv-parser —> JS objs
      .on('data', (data) => chunks.push(data))
      .on('end', () => {
        const chunkSize = 20; // NOTE: process in chunks! **

        for (let i = 0; i < chunks.length; i += chunkSize) {
          const chunk = chunks.slice(i, i + chunkSize);

          const modelData = chunk.map((row) => {
            return Object.fromEntries(
              attributes.map((attr) => [ attr, row[attr] ])
            );
          });

          importData.push(model.bulkCreate(modelData));
        }

        /*
        chunks.forEach((row) => {
          const modelData = Object.fromEntries(
            attributes.map((attr) => [ attr, row[attr] ])
          );

          importData.push(model.create(modelData));
        });
        */

        resolve();
      })
      .on('error', (err) => reject(err));
  });
}

// SYNC MODELS
sequelize
  .sync({ force: true }) // already exists —> recreate
  .then(() => {
    console.log('Tables created successfully!');

    /* IMPORT DATA
    const questionsCSV = fs.readFileSync(
      path.join(__dirname, '../csv/questions.csv'),
      'utf-8'
    );
    const answersCSV = fs.readFileSync(
      path.join(__dirname, '../csv/answers.csv'),
      'utf-8'
    );
    const productsCSV = fs.readFileSync(
      path.join(__dirname, '../csv/product.csv'),
      'utf-8'
    );
    const photosCSV = fs.readFileSync(
      path.join(__dirname, '../csv/answers_photos.csv'),
      'utf-8'
    );

    // NOTE: exclude header row!
    const questionsData = questionsCSV.split('\n').slice(1);
    const answersData = answersCSV.split('\n').slice(1);
    const productsData = productsCSV.split('\n').slice(1);
    const photosData = photosCSV.split('\n').slice(1);

    questionsData.forEach((question) => {
      const [
        id, product_id, body, date_written,
        asker_name, asker_email, reported, helpful
      ] = question.split(','); // comma-delimited

      importData.push(
        Question.create({
          id, product_id, body, date_written,
          asker_name, asker_email, reported, helpful
        })
      );
    });

    answersData.forEach((answer) => {
      const [
        id, question_id, body, date_written,
        answerer_name, answerer_email, reported, helpful
      ] = answer.split(',');

      importData.push(
        Answer.create({
          id, question_id, body, date_written,
          answerer_name, answerer_email, reported, helpful
        })
      );
    });

    productsData.forEach((product) => {
      const [ id, name ] = product.split(',');

      importData.push(
        Product.create({ id, name })
      );
    });

    photosData.forEach((photo) => {
      const [ id, answer_id, url ] = photo.split(',');

      importData.push(
        AnswerPhoto.create({ id, answer_id, url })
      );
    });

    return Promise.all(importData);
    */

    return Promise.all([
      parseCSV(
        questionStream,
        Question,
        [ 'id', 'product_id', 'body', 'date_written', 'asker_name', 'asker_email', 'reported', 'helpful' ]
      ),
      parseCSV(
        answerStream,
        Answer,
        [ 'id', 'question_id', 'body', 'date_written', 'answerer_name', 'answerer_email', 'reported', 'helpful' ]
      ),
      parseCSV(
        productStream,
        Product,
        [ 'id', 'name' ]
      ),
      parseCSV(
        photoStream,
        AnswerPhoto,
        [ 'id', 'answer_id', 'url' ]
      )
    ]);
  })
  .then(() => {
    console.log('Data imported successfully!');
  })
  .catch((err) => {
    console.error(`Error importing data: ${ err }`);
  });