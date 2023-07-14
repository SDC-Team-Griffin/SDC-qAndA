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

// IMPORT DATA
const importData = [];

const parseCSV = (stream, model, attributes) => {

  return new Promise((resolve, reject) => {
    const chunks = [];

    let bit = [];

    stream
      .pipe(csv.parse()) // stream —> fast-csv —> JS objs
      .on('data', (data) => {
        bit.push(data);

        // if too big —> offload **
        if (bit.length >= 50) {
          chunks.push(bit);
          bit = [];
        }
      })
      .on('end', () => {
        // NOTE: process in chunks! **

        if (bit.length > 0) {
          chunks.push(bit);
        }

        const insertChunks = chunks.map((chunk) => {

          const modelData = chunk.map((row) => {
            return Object.fromEntries(
              attributes.map((attr) => [ attr, row[attr] ])
            );
          });
          return model.bulkCreate(modelData);
        });

        Promise.all(insertChunks)
          .then(() => resolve())
          .catch((err) => reject(err));

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