// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var targetUsers = 3;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom
var numUsers = 0;

io.on('connection', (socket) => {
  ++numUsers;
  if ( numUsers == targetUsers ) {
    io.emit('fullRoom');
  }

  socket.on('add user', (username) => {
    // we store the username in the socket session for this client
    socket.username = username;
    socket.emit('login', {
      numUsers: numUsers
    });
  });

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    --numUsers;
  });

});
