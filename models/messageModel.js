const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const MessageSchema = mongoose.Schema({
  message: {
    type: String,
    required: true
  }
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
