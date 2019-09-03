const puppeteer = require('puppeteer');
const rootUrl = 'https://hackathon.schul-cloud.org'
const helper = require('./helper.js')
const courseID = '5d5c041d815e2e012ec7078f'
var browsers = [];
var pages = [];
var numPeers = 2;
// var intervalEnd = 5;
var peers = []
var runNum = process.argv[2];
var intervalEnd = process.argv[3];


// TODO:
// support for different timings + random distributionRange
// support for multiple runs

async function run() {
  await rampUp();
  console.log('All test runs completed')
  await helper.teardown(runNum, intervalEnd);
}

function rampUp () {
  return new Promise(async function(resolve, reject) {
    var clientPromises = []
    console.log("ramping up..")
    for(var i = 0; i < numPeers; i+=1) {

      var _client = testClient(i);
      clientPromises.push(_client)
    }
    await Promise.all(clientPromises);
    resolve()
  })
}
function testClient(peerId) {
  return new Promise(async function (resolve, reject){
    var timeout = helper.randomNumberInInterval(1000, intervalEnd*1000);


    console.log(timeout);

    setTimeout(async function(){
      try {
        var _peer = {
          peerId: peerId,
          timeout: timeout
        }
        var peer = await helper.launchPeer(_peer);
        var page = peer.page
        await helper.signIn(peer);
        await helper.sleep(2000)
        console.log('Navigating peer ' + peer.peerId + ' to /courses/')
        await page.click('[href="/courses/"]');
        await helper.sleep(3000)
        console.log('Navigating peer ' + peer.peerId + ' to Course details')
        await page.click('a[href="/courses/5d6d25287f289200133e37d7"].sc-card-header .sc-card-title');
        await helper.sleep(2000);
        console.log('Navigating peer ' + peer.peerId + ' to Course Topic')
        await page.click('.card.card-topic');
        peers.push(peer)
        resolve();
      } catch (e) {
        console.log(e);
        console.log("rerun client: " + peerId)
        await testClient(peerId)
        resolve();
      }
    }, timeout);

  })
}

run();
