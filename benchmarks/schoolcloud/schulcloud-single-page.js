const puppeteer = require('puppeteer');
const rootUrl = 'http://localhost:3100'
const helper = require('./helper.js')
var browsers = [];
var pages = [];
var numPeers = 1;

async function run() {
  await rampUp();
  var stats = await helper.getStatistic();
  console.log("stats: ")
  console.log(stats)
  await helper.teardown();
}

function rampUp () {
  return new Promise(async function(resolve, reject) {
    console.log("ramping up..")
    for(var i = 0; i < numPeers; i+=1) {
      var page = await helper.launchPeer(i);
      await helper.signIn(page);
      await helper.visit(page, '/dashboard/')
    }
    resolve()
  })
}

run();
