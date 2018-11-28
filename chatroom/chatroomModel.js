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
  },
  url: {type: String},
  active: {type: Boolean, required: true, default: true},
  asker: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

ChatroomSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
  }
});

function arrayLimit(val) {
  return val.length <= 2;
}
function genURL(len=10) {
  // len = len || 10;
  const alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let url = '/chat-room/';
  for(let i=0; i<len; i++) {
    url += alpha[Math.floor(Math.random()*alpha.length)];
  }
  return url;
}


const Chatroom = mongoose.model('Chatroom', ChatroomSchema);

module.exports = { Chatroom, genURL };
