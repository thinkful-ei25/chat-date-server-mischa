const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// const { User } = require('../users/userModel');

const MessageSchema = mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});
MessageSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
  }
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = { Message };
