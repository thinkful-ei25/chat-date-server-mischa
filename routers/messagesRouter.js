const express = require('express');
const bodyParser = require('body-parser');
// const messages = [

// ];
// const {User} = require('./models');
const { Message } = require('../models/messageModel');
const router = express.Router();

const jsonParser = bodyParser.json();

router.get('/chat-window', (req, res, next) => (
  Message.find()
    // .sort({ updatedAt: 'desc' })
    .then(results => {
      console.log(results);
      res.json(results);
    })
    .catch(err => {
      next(err);
    })
  // res.status(200).json(messages)
));

router.post('/post-message', jsonParser, (req, res, next) => {
  // console.log('request body:', req.body);
  const { message } = req.body;
  const requiredFields = ['message']; 
  const missingField = requiredFields.find(field => !(field in req.body));
  console.log('missing field:', missingField);
  // console.log('message is:', message);
  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }else{ 
    Message.create({message})
      .then(result => {
        // res.location(`${req.originalUrl}/${result.id}`).
        res.status(201).json(result);
      })
      .catch(err => {
        console.log(err);
        next(err);
      });
  }

});


module.exports =  router ;