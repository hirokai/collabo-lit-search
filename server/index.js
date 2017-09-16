const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const colors = require('colors');
const mkdirp = require('mkdirp');
const PubNub = require('pubnub');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.post('/add_history', (req, res) => {
  console.log(req.body);
  var publishConfig = {
    channel : "browse_history",
    message : req.body
  };

  pubnub.publish(publishConfig, function(status, response) {
    console.log(status, response);
    res.send('OK add_history');
  });

});

pubnub = new PubNub({
  publishKey : "pub-c-c19c6cd9-7cd8-4df6-99eb-f74cef20df2f",
  subscribeKey : "sub-c-7192bdba-979e-11e7-9b33-b625e713fcab"
});

app.get('/cols/', (req, res) => {
  res.redirect('/');
});

app.use(express.static('../public'));
app.listen(3000);
