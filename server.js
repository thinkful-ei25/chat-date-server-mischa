'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const socket = require('socket.io');

const { router: messageRouter } = require('./messages/messagesRouter');
const { router: userRouter } = require('./users/userRouter');
const { router: authRouter } = require('./auth/authRouter');
const { router: chatRoomRouter } = require('./chatroom/chatRoomRouter');
const { PORT, CLIENT_ORIGIN, MONGODB_URI } = require('./config');
const passport = require('passport');
const { localStrategy, jwtStrategy } = require('./auth/strategies');
const app = express();

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test',
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);
passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/api', messageRouter);
app.use('/api/chat-room/', chatRoomRouter);

// Custom 404 Not Found route handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Custom Error Handler
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
    // console.log(err);
  }
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
  let io = socket(server);
  io.on('connection', socket => {
    console.log('connected:', socket.id);
    socket.on('disconnect', () => {
      console.log(socket.id);
    });
    socket.on('subscribe', chatRoom => {
      console.log('room id:', chatRoom);
      socket.join(chatRoom);
    });
    socket.on('SEND_MESSAGE', function(data) {
      console.log(data);
      io.sockets.in(data.url).emit('RECIEVE_MESSAGE', data);
    });
  });
}

function dbConnect() {
  return mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true })
    .then(instance => {
      const conn = instance.connections[0];
      console.info(
        `Connected to: mongodb://${conn.host}:${conn.port}/${conn.name}`
      );
    })
    .catch(err => {
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
