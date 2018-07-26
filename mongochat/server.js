const mongo = require('mongodb').MongoClient;
const uri = '"mongodb://localhost:27017/mongochat';
const client = require('socket.io').listen(4000).sockets;

// Connect to Mongo
mongo.connect(uri, { useNewUrlParser: true }, function(err, mClient){
  if (err) {
    throw err;
  }

  console.log('MongoDB connected.');

  // Connect to socket.io
  client.on('connection', function(socket) {
    let chat = mClient.db.collection('chats');

    // Create function to send status
    sendStatus = function(s) {
      socket.emit('status', s);
    }

    // Get chats from mongo collection
    chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
      if (err) {
        throw err;
      }

      // Emit the messages
      socket.emit('output', res);
    });

    // Handle input events
    socket.on('input', function(data){
      let name = data.name;
      let message = data.message;

      // Check for name and messages
      if (name == '' || message == '') {
        // Send error status
        sendStatus('Please enter a name and message.')
      } else {
        // Insert message
        chat.insert({name: name, message: message}, function(){
          client.emit('output', [data]);

          // Send status object
          sendStatus({
            message: 'Message sent',
            clear: true
          });
        });
      }
    });

    // Handle clear
    socket.on('clear', function(data){
      // Remove all chats from collection
      chat.remove({}, function(){
        // Emit that everything is cleared
        socket.emit('cleared');
      })
    })
  });

});
