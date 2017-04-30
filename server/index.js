const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
var colors = require('colors');

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
  return exists_cache(word) ? mk_json_from_html(fs.readFileSync(path)) : null;
}

function save_cache(word, kind, dat) {
  const folder = __dirname + '/cache/' + kind;
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
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
