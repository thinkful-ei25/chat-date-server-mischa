const express = require('express');
const bodyParser = require('body-parser');
// const jwt = require('jsonwebtoken');
const passport = require('passport');
const { Message } = require('../messages/messageModel');
const { User } = require('../users/userModel');
const { Chatroom, genURL } = require('./chatroomModel');
const router = express.Router();

const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate('jwt', {session: false});
// function getUserId(req, res, next){
//   // console.log('req is:', req.user.username);
//   User.findOne({username: req.user.username})
//     .then((result) => {
//       // console.log('result id is: ', result._id);
//       req.userId = result._id;
//       next();
//     });
    
// }
router.post('/', jwtAuth, /* getUserId, */ (req, res, next) => {
  return (
    Chatroom.create({users: req.user.id})
      .then((result) => {
        const id = {_id: result._id};
        const url =  genURL();
        Chatroom.findOneAndUpdate(id, {url})
          .then((result) => {
            // console.log('new chatroom: ',result);
            res.location(`${req.originalUrl}/${result.id}`).status(201).json({url, id: result._id});
          });
        // res.sendStatus(201);
      })
      // .populate('users')
      // .populate('messages')
      // .then(result => {
      //   // console.log(results);
      .catch(err => {
        console.log(err);
        next(err);
      })
  );
}
);
//create put route for new user to join room
// router.post('/chat-room', jsonParser, jwtAuth, (req, res, next) => {
//   console.log('', req.body.user);
//   const { user, message } = req.body;
//   const requiredFields = ['user', 'message']; 
//   const missingField = requiredFields.find(field => !(field in req.body));
//   // console.log('missing field:', missingField);
//   // console.log('message is:', message);
//   if (missingField) {
//     return res.status(422).json({
//       code: 422,
//       reason: 'ValidationError',
//       message: 'Missing field',
//       location: missingField
//     });
//   }else{ 

//     User.find({username: user})
//       .then(([res]) => (res._id))
//       .then((user) => {
//         Message.create({message, user})
//           .then(result => {
//             // res.location(`${req.originalUrl}/${result.id}`).
//             const { message } = result;
//             res.status(201).json({message, username: user});
//           });
//       })
   
//       .catch(err => {
//         console.log(err);
//         next(err);
//       });
//   }

// });


module.exports =  {router} ;