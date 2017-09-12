// @flow

// declare var chrome:any;

const username = 'Kai';

const watchTarget = (url) => {
  if (url.indexOf("https://www.nature.com/") == 0) return true;
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // console.debug(changeInfo);
  if (watchTarget(tab.url)) {
    var str = '';
    if (changeInfo.title) {
      str += 'Loading: ' + changeInfo.title + ' ';
      sendLogTitle(tab.url, changeInfo.title)
    } else if (changeInfo.status == 'loading') {
      sendLogUrl(tab.url, (res) => {
        console.log(res);
      });
    } else if (changeInfo.status == 'complete') {
      str += 'Complete: ';
      console.log(tab);
    }
    str += tab.url;
    console.log(str);
  }
});

function sendLogUrl(url, callback) {
  $.post('http://localhost:3000/add_history', {user: username, url: url}, callback);
}

function sendLogTitle(url, title, callback) {
  $.post('http://localhost:3000/add_history', {user: username, url: url, title: title}, callback);
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