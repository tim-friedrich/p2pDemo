var rootUrl = 'https://hackathon.schul-cloud.org';
const puppeteer = require('puppeteer');
const Statistic = require('./statistics.js')
var fs = require("fs");

var pages = [];
var browsers = [];
var username = 'schueler@schul-cloud.org'
var password = 'Schulcloud1!'
const headless = true;
var peers = []

var statsClients = []

var _sleep = function (milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

var clearStatistic = async function (page) {
  await page.evaluate(async () => {
    return await idbKeyval.set('swLogs', '');
  });
}
var signIn = function (peer) {
  return new Promise(async function(resolve, reject) {
    try {
      var page = peer.page;
      console.log("signing in client: " + peer.peerId)
      // await page.screenshot({path: '2.png', fullPage: true});
      await page.goto(rootUrl + '/login/')
      await page.type(".login-form [name=username]", username);
      await page.type(".login-form [name=password]", password);
      //await page.screenshot({path: '2.png', fullPage: true});
      await page.click('.login-form [type="submit"]');
      await page.waitForNavigation();
      await _sleep(10000);
      await page.goto(rootUrl + '/dashboard/')
      await clearStatistic(page)
      var statistic = new Statistic(peer)
      peer.statistic = statistic;
      await statistic.start();
      statsClients.push(statistic);
      await _sleep(1000);
      await page.reload(rootUrl);
      statistic.measureNavigation();

      resolve(page);
      return page;
    } catch(e) {
      console.log('Sign in failed: '+ peer.peerId)
      await signIn(peer)
      resolve(peer.page)
    }
  })
}

var saveStatistics = async function(runNum, interval) {
  console.log("Gathering Sw statistics")
  data = {
    runNum: runNum,
    interval: interval
  }
  var result = [];
  var promises = []
  for(var i = 0; i<peers.length; i+=1) {
    promises.push(statsClients[i].stop());
  }
  await Promise.all(promises);
  await _sleep(30000)
  console.log("starting to combine the statistic")
  for(var i = 0; i<peers.length; i+=1) {
    var pageStats = await peers[i].statistic.peerStats();
    result = result.concat(pageStats);
  }
  data.result = result

  var filepath = "./logs/fullPath"+runNum+"Interval"+interval+".json"
  var jsonData = JSON.stringify(data);
  fs.writeFileSync(filepath, jsonData);
}

module.exports = {
  sleep: _sleep,
  visit: function (page, path) {
    page.goto(rootUrl+path, {waitUntil: 'networkidle2'});
  },
  clearStatistic: clearStatistic,
  launchPeer: function (peer){
    return new Promise(async function(resolve, reject){
      var peerId = peer.peerId;
      console.log("launching Peer " + peerId)
      const browser = await puppeteer.launch({headless: headless});

      browsers.push(browser);
      var page = await browser.newPage();
      //await page.setCacheEnabled(false);

      pages.push(page)
      peer.page = page
      peers.push(peer);
      resolve(peer)
      return peer;
    })
  },
  randomNumberInInterval(start, stop) {
    return Math.floor(Math.random() * stop) + start
  },
  signIn: signIn,
  teardown: async function (runNum, interval) {
    await _sleep(20000)

    await saveStatistics(runNum, interval);
    for(var i = 0; i<browsers.length; i++) {
      await browsers[i].close();
    }
  },
  saveStatistics: saveStatistics
};
