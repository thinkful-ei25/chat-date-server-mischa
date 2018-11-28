const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const ChatQuestionsSchema = mongoose.Schema({
  questions: [{type: String}]
});

ChatQuestionsSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
  }
});


const ChatQuestion = mongoose.model('ChatQuestion', ChatQuestionsSchema);
module.exports = { ChatQuestion };