const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');


app.get('/cols/', (req, res) => {
  res.redirect('/');
});

app.use(express.static('public'));
app.listen(80);

setInterval(() => {
  io.emit('add_node', {from: 'Hoge', to: 'Fuga'});
}, 3000);

io.on('connection', function (socket) {
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
