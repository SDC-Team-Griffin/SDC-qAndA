require('dotenv').config();
const { USER, DB } = process.env;
const fs = require('fs');
const path = require('path');

const csv = require('fast-csv'); // CSV parsing library **

const connectionString = `postgres://${ USER }@localhost:5432/${ DB }`;

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(connectionString, {
  pool: { acquire: 600000 } // NOTE: increased timeout to 10 min **
});

/*
sequelize.authenticate()
  .then(() => {
    console.log('Connection authenticated!');
  })
  .catch((err) => {
    console.error(`Error connecting to DB: ${ err }`);
  });
*/

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

// IMPORT DATA
const importData = [];

const parseCSV = (stream, model, attributes, batchSize = 100) => {

  return new Promise((resolve, reject) => {
    const rows = [];
    let rowCount = 0;

    stream
      .pipe(csv.parse({ headers: true })) // skips header row
      .on('data', (data) => {
        rows.push(
          Object.fromEntries(attributes.map((attr) => [ attr, data[attr] ]))
        );
        rowCount++;

        if (rowCount >= batchSize) {
          model.bulkCreate(rows)
            .then(() => {
              rows.length = 0;
              rowCount = 0;
            })
            .catch((err) => reject(err));
        }
      })
      .on('end', () => {
        if (rowCount > 0) {
          model.bulkCreate(rows)
            .then(() => resolve())
            .catch((err) => reject(err));

        } else {
          resolve();
        }
      })
      .on('error', (err) => reject(err));
  });
};

(async() => {

  try {
    await sequelize.sync();
    console.log('Tables synced successfully!');

    const csvFiles = [
      {
        stream: fs.createReadStream(path.join(__dirname, '../csv/questions.csv')),
        model: Question,
        attributes: [ 'id', 'product_id', 'body', 'date_written', 'asker_name', 'asker_email', 'reported', 'helpful' ]
      },
      {
        stream: fs.createReadStream(path.join(__dirname, '../csv/answers.csv')),
        model: Answer,
        attributes: [ 'id', 'question_id', 'body', 'date_written', 'answerer_name', 'answerer_email', 'reported', 'helpful' ]
      },
      {
        stream: fs.createReadStream(path.join(__dirname, '../csv/product.csv')),
        model: Product,
        attributes: [ 'id', 'name' ]
      },
      {
        stream: fs.createReadStream(path.join(__dirname, '../csv/answers_photos.csv')),
        model: AnswerPhoto,
        attributes: [ 'id', 'answer_id', 'url' ]
      }
    ];

    await Promise.all(
      csvFiles.map(({ stream, model, attributes }) =>
        parseCSV(stream, model, attributes)
      )
    );
    console.log('Data imported successfully!');

    // NOTE: only query products w/ questions! **
    const products = await Product.findAll({
      include: {
        model: Question,
        required: true
      }
    });

    await sequelize.close();
    console.log('Connection closed!');

  } catch(err) {
    console.error(`Error importing data: ${ err }`);
  }
})();