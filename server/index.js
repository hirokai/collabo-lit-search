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

function exists_cache(word,kind){
  const folder = __dirname + '/cache/' + kind;
  const path = folder + '/' + word + '.html';
  return fs.existsSync(path);
}

function read_cache(word, kind){
  const folder = __dirname + '/cache/' + kind;
  const path = folder + '/' + word + '.html';
  return fs.existsSync(path) ? mk_json_from_html(fs.readFileSync(path)) : null;
}

function save_cache(word, kind, dat) {
  const folder = __dirname + '/cache/' + kind;
  if (!fs.existsSync(folder)) {
    mkdirp(folder);
  }
  const path = folder + '/' + word + '.html';
  fs.writeFileSync(path, dat);
}

function mk_json_from_html(html) {
  const $ = cheerio.load(html);
  const titles = $(".gs_ri > h3 > a").map((i, el) => {
    return {title: $(el).html(), url: $(el).attr('href')};
  }).get();
  return titles;
}

app.get('/search', (req, res) => {
  const word = req.query.q;
  console.log('Querying:' + word + '...');
  const obj = read_cache(word, "scholar");
  if(obj){
    console.log('Found cache.'.green)
    res.json({ok: true, titles: obj});
  }else{
    const url = "https://scholar.google.co.jp/scholar?hl=ja&q=" + encodeURIComponent(word) + "&btnG=&lr=lang_en%7Clang_ja"
    axios.get(url).then((res2) => {
      console.log("Received.".green);
      const html = res2.data;
      save_cache(word, "scholar", html);
      const obj = mk_json_from_html(html);
      res.json({ok: true, titles: obj});
    }).catch((err) => {
      console.log(err);
      res.json({ok: false});
    });
  }
})

app.use(express.static('../public'));
app.listen(3000);

setInterval(() => {
  io.emit('add_node', {from: 'Hoge', to: 'Fuga'});
}, 3000);

io.on('connection', function (socket) {
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
