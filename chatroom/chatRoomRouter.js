const express = require('express');
const bodyParser = require('body-parser');
// const jwt = require('jsonwebtoken');
const passport = require('passport');
const { ChatQuestion } = require('./chatQuestionsModel');
const { Chatroom, genURL } = require('./chatroomModel');
const router = express.Router();
const jsonParser = bodyParser.json();

const jwtAuth = passport.authenticate('jwt', { session: false });

router.get('/list', jwtAuth, (req, res, next) => {
  return Chatroom.find({ active: true })
    .then(result => {
      res.status(201).json({ result });
    })
    .catch(err => {
      next(err);
    });
});

function getQuestions(req, res, next) {
  ChatQuestion.find().then(result => {
    [req.questions] = result;
    next();
  });
}
router.post('/', jwtAuth, getQuestions, (req, res, next) => {
  const { questions } = req;
  Chatroom.create({ users: req.user.id, asker: req.user.id })
    .then(result => {
      const id = { _id: result._id };
      const url = genURL();
      Chatroom.findOneAndUpdate(id, { url }).then(result => {
        res
          .location(`${req.originalUrl}/${result.id}`)
          .status(201)
          .json({ url, id, questions });
        return result;
      });
    })
    .catch(err => {
      next(err);
    });
});
function missingField(req, res, next) {
  const requiredFields = ['url'];
  let missingField = requiredFields.find(field => !(field in req.headers));
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField,
    });
  } else {
    next();
  }
}
router.put(
  '/join-room',
  jsonParser,
  jwtAuth,
  missingField,
  getQuestions,
  (req, res, next) => {
    const { url } = req.headers;
    const { questions } = req;
    const userId = req.user.id;
    Chatroom.findOne({ url })
      .then(result => {
        if (!result.users.toString().includes(req.user.id)) {
          return Chatroom.findOneAndUpdate(
            { url },
            { $push: { users: userId } },
            { new: true }
          );
        }
      })
      .then(() => {
        res.status(201).json(questions);
      })
      .catch(err => {
        next(err);
      });
  }
);

router.put('/leave-room', jwtAuth, missingField, (req, res, next) => {
  const { url } = req.headers;
  Chatroom.findOneAndUpdate(
    { url },
    { $pull: { users: req.user.id }, active: false },
    { new: true }
  )
    .then(() => {
      res.sendStatus(201);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = { router };
