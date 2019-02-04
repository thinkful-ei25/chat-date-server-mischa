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

  //openRooms object --> contains chatroomId: {user1, user2}
  let openRooms = {};
  let people = {};
  function leaveRoom(socket, referer) {
    if (referer !== `${CLIENT_ORIGIN}/dashboard`) {
      let { chatroom } = people[socket];
      if (people[socket]) {
        openRooms[chatroom].active = false;
        openRooms[chatroom].forEach(user => {
          if (socket.id === user.socketId) {
            user.active = false;
          }
        });
      }
      return chatroom;
    }
  }
  function findActiveRooms() {
    const rooms = Object.keys(openRooms);
    return rooms.find(room => {
      if (openRooms[room].active) {
        return true;
      }
    });
  }

  io.on('connection', socket => {
    socket.on('disconnect', () => {
      const { referer } = socket.handshake.headers;
      const chatroom = leaveRoom(socket, referer);
      if (chatroom) {
        io.sockets.to(chatroom).emit('partnerLeftRoom', {
          user1: openRooms[chatroom][0],
          user2: openRooms[chatroom][1],
        });
      }
    });

    socket.on('subscribe', ({ chatroom, username }) => {
      socket.join(chatroom);
      if (openRooms[chatroom]) {
        openRooms[chatroom][1] = {
          username,
          socketId: socket.id,
          active: true,
        };
      } else {
        openRooms[chatroom] = [
          { username, socketId: socket.id, active: true },
          { user2: null },
        ];
        openRooms[chatroom].active = true;
      }
      people[socket] = { username, chatroom };

      //send user data for both users when user subscribes ==> update front eend with that info
      io.sockets.to(chatroom).emit('joined', {
        user1: openRooms[chatroom][0],
        user2: openRooms[chatroom][1],
      });

      io.sockets.emit('active-rooms', findActiveRooms(io));
    });
    socket.on('find-room', () => {
      io.sockets.emit('active-rooms', findActiveRooms(io));
    });

    socket.on('SEND_MESSAGE', function(data) {
      console.log(data);
      io.sockets.to(data.url).emit('recieve_message', {
        message: data.message,
        user: data.username,
      });
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
