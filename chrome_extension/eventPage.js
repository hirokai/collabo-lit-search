// @flow

// declare var chrome:any;

const username = 'Kai';

const watchTarget = (url) => {
  const urls = ["www.nature.com/",'pubs.acs.org/doi/','journals.plos.org/'];
  if(_.find(urls,(u) => {const idx = url.indexOf(u); return idx == 8 || idx == 7;})){
    return true;
  }else{
    return false;
  }
};

chrome.tabs.onCreated.addListener((tab) => {
  chrome.tabs.get(tab.openerTabId,(parent) => {
    console.log('Opened from: ' + parent.title);
  });
});

var url_history = {};
var title_list = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // console.debug(changeInfo);
  if (watchTarget(tab.url)) {
    chrome.browserAction.setIcon({path: 'target.png'});
    var str = '';
    if (changeInfo.title) {
      // chrome.notifications.create('1',{type: 'basic', iconUrl: 'icon.png', title: 'Cols', message: tab.title});
      title_list[tab.url] = tab.title;
      str += 'Loading: ' + changeInfo.title + ' ';
      if(tab.openerTabId){
        chrome.tabs.get(tab.openerTabId,(parent) => {
          sendLogTitle(tab.url, parent.url, tab.title, (res) => {
            console.log(res);
          });
        });
      }else{
        sendLogTitle(tab.url, null, tab.title, (res) => {
          console.log(res);
        });
      }
    } else if (changeInfo.status == 'loading') {
      if(url_history[tab.id]){
        url_history[tab.id].push(tab.url);
      }else{
        url_history[tab.id] = [tab.url];
      }

    } else if (changeInfo.status == 'complete') {
      str += 'Complete: ';
      console.log(url_history);
    }
    str += tab.url;
    console.log(str);
  }else{
    chrome.browserAction.setIcon({path: 'icon.png'});
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  const h = url_history[activeInfo.tabId];
  console.log(url_history,activeInfo,h);
    if(h){
      const title = title_list[h[h.length-1]];
      $.post('http://localhost:3000/add_history', {user: username, action: 'change_tab', title: title}, (res) => {
        console.log(res);
      });
    }
});

function sendLogTitle(url, parent, title, callback) {
  $.post('http://localhost:3000/add_history', {user: username, action: 'browse', url: url, title: title}, callback);
}

pubnub = new PubNub({
  publishKey : "pub-c-c19c6cd9-7cd8-4df6-99eb-f74cef20df2f",
  subscribeKey : "sub-c-7192bdba-979e-11e7-9b33-b625e713fcab"
});

pubnub.subscribe({
  channels: ['browse_history']
});

pubnub.addListener({
  message: (msg) => {
    console.log('pubnub.subscribe',msg);
  }
});