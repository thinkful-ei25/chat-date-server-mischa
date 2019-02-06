const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const { ChatQuestion } = require('../chatroom/chatQuestionsModel');
const questions = [
  'Where was your grandmother born?',
  'How many pets did you have growing up?',
  'Where were you born?',
  "Where's the furthest you've travelled?",
  'How many siblings do you have?',
];

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    return ChatQuestion.create({ questions });
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });
