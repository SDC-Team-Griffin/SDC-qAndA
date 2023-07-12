const mongoose = require('mongoose');

// SCHEMAS
const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }]
});

const photoSchema = new mongoose.Schema({
  id: Number,
  url: String
});

const questionSchema = new mongoose.Schema({
  id: Number,
  body: String,
  asker_name: String,
  date: { type: Date, default: Date.now },
  helpfulness: { type: Number, default: 0 },
  reported: { type: Boolean, default: false },
  answers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  }]
});

const answerSchema = new mongoose.Schema({
  id: Number,
  body: String,
  answerer_name: String,
  date: { type: Date, default: Date.now },
  helpfulness: { type: Number, default: 0 },
  reported: { type: Boolean, default: false },
  photos: [ photoSchema ]
});

// MODELS
const Product = mongoose.model('Product', productSchema);
const Photo = mongoose.model('Photo', photoSchema);
const Question = mongoose.model('Question', questionSchema);
const Answer = mongoose.model('Answer', answerSchema);