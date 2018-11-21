const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;
mongoose.Promise = global.Promise;

const ChatroomSchema = mongoose.Schema({
  name: {type: String, default: 'New Chat Room!'},
  messages: [{type : ObjectId, ref: 'Message' }],
  users: {
    type: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    validate: [arrayLimit, '{PATH} exceeds the limit of 2'],
    required: true
  }
});

function arrayLimit(val) {
  return val.length <= 2;
}

const Chatroom = mongoose.model('Chatroom', ChatroomSchema);

module.exports = { Chatroom };
