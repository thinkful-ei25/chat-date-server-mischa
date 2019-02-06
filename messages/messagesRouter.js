const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
// const {User} = require('./models');
const { Message } = require('./messageModel');
const { Chatroom } = require('../chatroom/chatroomModel');
const { User } = require('../users/userModel');
const router = express.Router();

const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate('jwt', { session: false });

//validate user!
function userInChatRoom(req, res, next) {
  const { url } = req.headers;
  Chatroom.findOne({ url })
    .then(result => {
      if (!result.users.includes(req.user.id).toString()) {
        res.sendStatus(401);
      } else {
        next();
      }
    })
    .catch(err => next(err));
}

router.get('/chat-window', jwtAuth, (req, res, next) => {
  const { url } = req.headers;
  return Chatroom.findOne({ url })
    .populate('users')
    .populate('messages')
    .then(results => {
      res.status(200).json(results);
    })
    .catch(err => {
      next(err);
    });
});
//ensure user is in chatroom

function missingField(req, res, next) {
  const requiredFields = ['message'];
  const requireHeaderFields = ['url'];
  const missingHeaderField = requireHeaderFields.find(
    field => !(field in req.headers)
  );
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField || missingHeaderField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField,
    });
  } else {
    return next();
  }
}

router.post(
  '/chat-window',
  jsonParser,
  jwtAuth,
  userInChatRoom,
  missingField,
  (req, res, next) => {
    const { id: user } = req.user;
    const { message } = req.body;
    const { url } = req.headers;

    Message.create({ message, user })
      .then(result => {
        return result._id;
      })
      .then(messageId => {
        Chatroom.findOneAndUpdate(
          { url },
          { $push: { messages: messageId } },
          { new: true }
        ).then(result => {
          res.status(201).json({ result });
        });
      })
      .catch(err => {
        next(err);
      });
  }
);

module.exports = { router };
