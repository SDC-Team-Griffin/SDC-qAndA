require('dotenv').config();
const { USER, DB } = process.env;
const fs = require('fs');
const path = require('path');

const csv = require('csv-parser'); // CSV parsing library **

const connectionString = `postgres://${ USER }@localhost:5432/${ DB }`;

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(connectionString, {
  pool: { acquire: 600000 } // NOTE: increased timeout to 5 min **
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

/* NOTE: must process in chunks (too big for Sequelize)

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

const parseCSV = (stream, model, attributes) => {
  return new Promise((resolve, reject) => {
    const chunks = [];

    let bit = [];

    stream
      .pipe(csv()) // stream —> csv-parser —> JS objs
      .on('data', (data) => {
        // chunks.push(data);
        bit.push(data);

        // if too big —> offload **
        if (bit.length >= 100) {
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

        /*
        const chunkSize = 20;

        for (let i = 0; i < chunks.length; i += chunkSize) {
          const chunk = chunks.slice(i, i + chunkSize);

          const modelData = chunk.map((row) => {
            return Object.fromEntries(
              attributes.map((attr) => [ attr, row[attr] ])
            );
          });

          importData.push(model.bulkCreate(modelData));
        }

        resolve();
        */
      })
      .on('error', (err) => reject(err));
  });
};

(async() => {
  try {
    await sequelize.sync({ force: true });
    console.log('Tables synced!');

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
      includes: [{
        model: Question,
        required: true
      }]
    });

    await sequelize.close();
    console.log('Connection closed!');

  } catch(err) {
    console.error(`Error importing data: ${ err }`);
  }
})();

/* SYNC MODELS
sequelize
  .sync({ force: true }) // already exists —> recreate
  .then(() => {
    console.log('Tables created successfully!');

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
*/