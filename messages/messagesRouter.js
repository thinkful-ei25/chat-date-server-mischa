const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
// const {User} = require('./models');
const { Message } = require('./messageModel');
const { Chatroom } = require('../chatroom/chatroomModel');
const { User } = require('../users/userModel');
const router = express.Router();

const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate('jwt', {session: false});

router.get('/chat-window', jwtAuth, (req, res, next) => {
  const {path} = req.headers;

  return (
    Chatroom.findOne({url: path})
      .populate('users')
      .populate('messages')
      .then((results) => {
        res.status(200).json(results);
      })
      .catch(err => {
        next(err);
      })
  );
});
router.post('/chat-window', jsonParser, jwtAuth, (req, res, next) => {

  const { username, userId: user, message, path: url } = req.body;
  const requiredFields = ['userId', 'message', 'roomId']; 

  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }else{ 
    Message.create({message, user})
    //add return statements to remove then nesting
      .then(result => {
        const messageId = result._id;
        Chatroom.findOneAndUpdate({url}, {$push: {messages: messageId}}, {new: true})
          .then(() => {
            res.status(201).json({message, username});
          });
      })
      // })
   
      .catch(err => {
        // console.log(err);
        next(err);
      });
  }

});


module.exports =  {router} ;