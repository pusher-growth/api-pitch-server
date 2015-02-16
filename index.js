var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var sanitizer = require('sanitizer');

var Pusher = require('pusher');
var config = require('./Config');

var pusher = new Pusher(config);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(function (req, res, next) {
  console.log('Request URL:', req.originalUrl);
  next();
});

app.post('/users_online', function(req, res) {
  var channelName = req.body.channel_name;
  var socketId = req.body.socket_id;
  var channelData = null;
  
  if(channelName === 'presence-users-online') {
    // Only used for counting online users
    // Real user information doesn't need to be supplied
    channelData = {user_id: socketId};
  }
  
  var auth = pusher.authenticate(socketId, channelName, channelData);
  res.json(auth);
});

app.post('/notification', function(req, res) {
  var text = req.body.text;
  var msg = sanitizer.escape(text);
  pusher.trigger('notifications', 'user', {msg: msg});
  
  res.status(201).end();
});

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('listening on port %d', port);
});
