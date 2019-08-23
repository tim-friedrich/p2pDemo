const puppeteer = require('puppeteer');
const rootUrl = 'https://staging.slidesync.com/b8vrGYJBer'

// var browsers = [];
var pages = [];
var numberOfPeers = 10;
var browser;
function Sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function visitPage(page, path) {
  await page.goto(rootUrl+path, {waitUntil: 'networkidle2'});
}

async function run() {
  console.log("Starting test run")
  browser = await puppeteer.launch({headless: true, executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome'});

  for (var i=0; i < numberOfPeers; i+=1) {
    console.log("launching Peer " + (i+1))

    await launchPeer(i);
    await Sleep(1000)
  }
  // await Sleep(10000);

  console.log("All Peers are launched");
  await teardown();
}

async function teardown() {
  await Sleep(1200000)
  for(var i = 0; i<browsers.length; i++) {
    await browsers[i].close();
  }
}

function launchPeer(id){
  return new Promise(async function(resolve, reject){
    // browsers.push(browser);
    const context = await browser.createIncognitoBrowserContext();
    var page = await context.newPage({ context: ''+id });
    await page.goto(rootUrl, {waitUntil: 'networkidle2'});
    pages.push(page)

    page.waitForSelector('.vjs-big-play-button', {timeout: 0, visible: true})
      .then(function () { page.click('.vjs-big-play-button') });

    resolve(page)
  })
}

run();
