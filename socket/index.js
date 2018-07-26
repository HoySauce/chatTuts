// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var targetUsers = 1;
var generatedUsername = "Team Member ";
var tempUsername;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom

var numUsers = 0;

io.on('connection', (socket) => {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    // new Date()
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
      // date: Date.now()
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    ++numUsers;
    tempUsername = (generatedUsername + numUsers);
    socket.username = tempUsername;
    addedUser = true;

    socket.emit('login', {
      username: (tempUsername)
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});

var userCheck = setInterval( () => {
  if (numUsers == targetUsers) {
    io.emit('fullRoom', true);
    clearInterval(userCheck);
  } else {
    io.emit('fullRoom', false);
  }
}, 1000);
