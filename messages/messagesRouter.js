const express = require('express');
const bodyParser = require('body-parser');
// const jwt = require('jsonwebtoken');
const passport = require('passport');
// const messages = [

// ];
// const {User} = require('./models');
const { Message } = require('./messageModel');
const { User } = require('../users/userModel');
const router = express.Router();

const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate('jwt', {session: false});

router.get('/chat-window', jwtAuth, (req, res, next) => {
  console.log(jwtAuth);
  return (
    Message.find()
      // .sort({ updatedAt: 'desc' })
      .populate('user')
      .then(results => {
        // console.log(results);
        res.status(200).json(results);
      })
      .catch(err => {
        next(err);
      })
  );
}
);

router.post('/chat-window', jsonParser, jwtAuth, (req, res, next) => {
  console.log('', req.body.user);
  const { user, message } = req.body;
  const requiredFields = ['user', 'message']; 
  const missingField = requiredFields.find(field => !(field in req.body));
  // console.log('missing field:', missingField);
  // console.log('message is:', message);
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }else{ 

    User.find({username: user})
      .then(([res]) => (res._id))
      .then((user) => {
        Message.create({message, user})
          .then(result => {
            // res.location(`${req.originalUrl}/${result.id}`).
            const { message } = result;
            res.status(201).json({message, username: user});
          });
      })
   
      .catch(err => {
        // console.log(err);
        next(err);
      });
  }

});


module.exports =  {router} ;