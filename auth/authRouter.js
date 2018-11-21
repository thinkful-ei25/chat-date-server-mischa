'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const {User} = require('../users/userModel');

const config = require('../config');
const router = express.Router();
const jsonParser = bodyParser.json();
const createAuthToken = function(user) {
  return jwt.sign({user}, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256'
  });
};

const localAuth = passport.authenticate('local', {session: false});

// update loggedIn collection with user 
// router.use(bodyParser.json());
// The user provides a username and password to login

router.post('/login', jsonParser, localAuth, ((req, res, next) => {
  console.log(req.user.username);
  User.findOneAndUpdate({username: req.user.username},  {loggedIn: true})
    .then(() => {
      const authToken = createAuthToken(req.user.serialize());
      res.json({authToken});
    })
    .catch(err => {
      console.log(err);
      next(err);
    });
})
);

const jwtAuth = passport.authenticate('jwt', {session: false});

// The user exchanges a valid JWT for a new one with a later expiration
router.post('/refresh', jwtAuth, (req, res) => {
  console.log(req.user);
  const authToken = createAuthToken(req.user);
  res.json({authToken});
  
});

router.get('/logout', jwtAuth, (req, res, next) => {
  console.log('test');
  User.findOneAndUpdate({username: req.user.username},  {loggedIn: false})
    .then((result) => {
      console.log(result);
      res.sendStatus(200);
    })
    .catch(err => {
      console.log(err);
      next(err);
    });
});
// router.get('/logout', (req,res,next) => {
//   console.log('test');
// });

module.exports = {router};
