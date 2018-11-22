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
  const {roomid} = req.headers;
  console.log('room id is: ', roomid);

  return (
    Chatroom.findOne({_id: roomid})
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
    // Message.find({roomId})
    //   // .sort({ updatedAt: 'desc' })
    //   .populate('user')
    //   .populate()
    //   .then(results => {
    //     res.status(200).json(results);
    //   })
    //   .catch(err => {
    //     next(err);
    //   })

router.post('/chat-window', jsonParser, jwtAuth, (req, res, next) => {
  // console.log('', req.body.user);
  const { user, message, roomId } = req.body;
  const requiredFields = ['user', 'message', 'roomId']; 
  // console.log('room id is :', roomId);
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
        //add return statements to remove then nesting
          .then(result => {
            const messageId = result._id;
            Chatroom.findOneAndUpdate({_id: roomId}, {$push: {messages: messageId}}, {new: true})
              .then(() => res.status(201).json({message, username: user}));
          });
      })
   
      .catch(err => {
        // console.log(err);
        next(err);
      });
  }

});


module.exports =  {router} ;