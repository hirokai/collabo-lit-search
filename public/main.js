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
  //$.post('/start_mock_sequence');
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

var example1 = new Vue({
  el: '#paper-list1-wrapper',
  data: {
    items: [
    ]
  }
});

var example2 = new Vue({
  el: '#paper-list2-wrapper',
  data: {
    items: [
    ]
  }
});

var example3 = new Vue({
  el: '#paper-list3-wrapper',
  data: {
    items: [
    ]
  }
});


pubnub.addListener({
  message: (d) => {
    const m = d.message;
    console.log('pubnub.subscribe', d);
    const target = m.user == 'Alice' ? example1 : example2;
    if(m.action == 'search'){
        target.items.push({action: m.action, message: `[${m.searchId}] 検索：${m.keyword} → ${m.num_results} results.`});
    }else if(m.action == 'change_tab'){
        target.items.push({action: m.action, message: `アクティブ：${m.title}`});      
    }else if (m.action == 'browse'){
      if (m.parent){
        target.items.push({action: m.action, message: `開きました：${m.parent} -> ${m.title}`});
      } else if(m.title){
        target.items.push({action: m.action, message: '開きました：' + m.title});
      }
    }
  }
});

