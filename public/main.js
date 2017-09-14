// var socket = io('http://localhost:3000');
// socket.on('add_node', function (data) {
//   console.log(data);
// });


function initializeData() {
  const d = localStorage.getItem('cols.papers');
  if (!d)
    localStorage.setItem('cols.papers', '[]');
  const papers = JSON.parse(localStorage.getItem('cols.papers'));
  update_paper_list(papers);
}

initializeData();

var globalState = {
  state: 'normal',
  selections: [],
  scale: 1
};


pubnub = new PubNub({
  publishKey: "pub-c-c19c6cd9-7cd8-4df6-99eb-f74cef20df2f",
  subscribeKey: "sub-c-7192bdba-979e-11e7-9b33-b625e713fcab"
});

pubnub.subscribe({
  channels: ['browse_history']
});



pubnub.addListener({
  message: (d) => {
    console.log('pubnub.subscribe', d);
    if(d.message.action == 'change_tab'){
      var p = $('<div/>');
      p.attr('class','paper-list-entry');
      p.html('アクティブ: ' + d.message.title);
      $('#paper-list').append(p);
    }else if (d.message.action == 'browse'){
      if(d.message.title){
        var p = $('<div/>');
        p.attr('class','paper-list-entry');
        p.html('開きました: ' + d.message.title);
        $('#paper-list').append(p);
      }
    }
  }
});

