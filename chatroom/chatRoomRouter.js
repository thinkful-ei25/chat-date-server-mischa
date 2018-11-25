const express = require('express');
const bodyParser = require('body-parser');
// const jwt = require('jsonwebtoken');
const passport = require('passport');
const { Message } = require('../messages/messageModel');
const { User } = require('../users/userModel');
const { Chatroom, genURL } = require('./chatroomModel');
const {JwtStrategy, ExtractJwt } = require('passport-jwt');
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
router.get('/chat-rooms-list',jwtAuth,(req, res, next) => {
  return (
    Chatroom.find({active: true})
      .then((result) => {
        res.status(201).json({result});
      })
      .catch(err => {
        next(err);
      })
  );
});

router.post('/chat-room', jwtAuth, /* getUserId, */ (req, res, next) => {
  console.log('user id: ', req.user.id);
  return (
    Chatroom.create({users: req.user.id})
      .then((result) => {
        console.log('result is: ', result);
        const id = {_id: result._id};
        const url =  genURL();
        Chatroom.findOneAndUpdate(id, {url})
          .then((result) => {
            // console.log('new chatroom: ',result);
            res.location(`${req.originalUrl}/${result.id}`).status(201).json({url, id});
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

router.put('/chat-room/join-room', jsonParser, jwtAuth, (req, res, next) => {
  const {roomUrl : url} = req.body;
  const userId = req.user.id;
  const requiredBodyFields = ['roomUrl']; 
  const requiredFields = ['id'];
  let missingField = requiredBodyFields.find(field => !(field in req.body));
  missingField += requiredFields.find(field => !(field in req.user));
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }else{ 
    Chatroom.findOne({url})
      .then(result => {
        if(!result.users.includes(req.user.id)){
          return Chatroom.findOneAndUpdate({url}, {$push: {users: userId}}, {new: true});
        }
      })
      .then((result) => {
        console.log('result from findoneandupdate:', result);
        res.sendStatus(201);
      })
      .catch(err => {
        next(err);
      });  
  }

});
//create put route for new user to join room
router.put('/chat-room/leave-room', jsonParser, jwtAuth, (req, res, next) => {
  // const token = ExtractJwt.fromAuthHeaderWithScheme('Bearer'); 
  const {roomUrl} =  req.body;
  console.log('room url is: ', req.body);
  const requiredBodyFields = ['roomUrl']; 
  const requiredFields = ['id'];
  let missingField = requiredBodyFields.find(field => !(field in req.body));
  missingField += requiredFields.find(field => !(field in req.user));
  console.log(missingField);
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }else{ 

    Chatroom.findOneAndUpdate({url: roomUrl}, {$pull: {users: req.user.id}}, {new: true})
      .then((response) => {
        console.log('response from 115: ', response);
        if(response.users.length === 0){
          Chatroom.findOneAndUpdate({url: roomUrl}, {active: false}, {new: true})
            .then(()=> res.sendStatus(201))
            .catch(err => {
              console.log(err);
              next(err);
            });
        }else {
          res.sendStatus(201);
        }
      })
      .catch(err => {
        console.log(err);
        next(err);
      });
  }
});


module.exports =  {router} ;