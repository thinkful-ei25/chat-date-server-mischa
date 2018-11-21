const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const LoggedInSchema = mongoose.Schema({
  loggedInUsers: [{ type : mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const LoggedIn = mongoose.model('LoggedIn', LoggedInSchema);

module.exports = {LoggedIn};
