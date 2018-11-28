'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {type: String, default: ''},
  lastName: {type: String, default: ''},
  loggedIn: {type: Boolean, default: false},
  active: {type: Boolean, default: false},
  connections: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
});

UserSchema.methods.serialize = function() {
  return {
    username: this.username || '',
    lastName: this.lastName || '',
    firstName: this.firstName || '',
    id: this._id
  };
};

UserSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
  }
});

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);

module.exports = {User};
