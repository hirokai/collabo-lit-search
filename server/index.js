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


var searchId = 0;

app.post('/add_history', (req, res) => {
  console.log(req.body);
  var msg = req.body;
  if(msg.action == 'search'){
    searchId += 1;
    msg.searchId = searchId;
  }
  var publishConfig = {
    channel : "browse_history",
    message : req.body
  };

  pubnub.publish(publishConfig, function(status, response) {
    console.log(status, response);
    res.send('OK add_history');
  });

});

const sequence = [
  [10,{user: 'Alice', action: 'search', keyword: 'VEGF receptor', num_results: 153}],
  [1,{user: 'Bob', action: 'search', keyword: 'cell membrane', num_results: 153}],
  [10,{user: 'Alice', action: 'browse', title: 'Alice'}],
  [20,{user: 'Alice', action: 'browse', parent: 'Alice', title: 'Bob'}],
  [3,{user: 'Alice', action: 'browse', parent: 'Alice', title: 'Chris'}],
  [1,{user: 'Bob', action: 'browse', title: 'Greg'}],
  [15,{user: 'Alice', action: 'browse', prev: 'Chris', title: 'Dave'}],
  [10,{user: 'Alice', action: 'browse', title: 'Edward'}],
  [10,{user: 'Alice', action: 'change_tab', title: 'Bob'}],
  [3,{user: 'Alice', action: 'search', keyword: 'VEGF receptor dynamics', num_results: 16}]
];

var timerId;
app.post('/start_mock_sequence', (req, res) => {
  var seqIndex = 0;
  var timerCount = 0;
  var searchCount = {'Alice': 0, 'Bob': 0};
  if(timerId){
    clearInterval(timerId);
  }
  timerId = setInterval(() => {
    timerCount += 1;
    const timerLength = sequence[seqIndex][0];
    if(timerLength == timerCount){
      timerCount = 0;
      const msg = sequence[seqIndex][1];
      seqIndex += 1;
      if(seqIndex == sequence.length){
        seqIndex = 0;
        clearInterval(timerId);
        timerId = null;
      }
      if(msg.action == 'search'){
        searchCount[msg.user] += 1;
        msg.searchId = `${searchCount[msg.user]}`
      }
      var publishConfig = {
        channel : "browse_history",
        message : msg
      };
      pubnub.publish(publishConfig, function(status, response) {
      });    
    }
  },100);
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
