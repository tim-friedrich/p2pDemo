const puppeteer = require('puppeteer');
const rootUrl = 'https://slidesync.com/oKkY3gwBwQ'

// var browsers = [];
var pages = [];
var numberOfPeers = 3;
var browser;
function Sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function visitPage(page, path) {
  await page.goto(rootUrl+path, {waitUntil: 'networkidle2'});
}

async function run() {
  console.log("Starting test run")
  browser = await puppeteer.launch({headless: true, executablePath: 'google-chrome'});

  for (var i=0; i < numberOfPeers; i+=1) {
    console.log("launching Peer " + (i+1));
    launchPeer(i);
    await Sleep(500)
  }
  await Sleep(10000);

  console.log("All Peers are launched");
  await teardown();
}

async function teardown() {
  await Sleep(600000)
  await browser.close();
}

function launchPeer(id){
  return new Promise(async function(resolve, reject){
    // browsers.push(browser);
    try {
    const context = await browser.createIncognitoBrowserContext();
    var page = await context.newPage({ context: ''+id });
    await page.goto(rootUrl, {waitUntil: 'networkidle2'});
    pages.push(page);
    try {
      page.on('framenavigated', function() {
        console.log("navigated")
      })
      page.evaluate(function () {
        setTimeout(function() {
          var playButton = $('.vjs-big-play-button')
          if(playButton.length >= 1) {
            playButton.click();
            $('.vjs-menu-button-levels').click()
            $('.vjs-menu-content').children().last().click()
          }
        }, 100)
      })
      // await Promise.all([
      //   page.waitForSelector('.vjs-big-play-button', {timeout: 0, visible: true})
      //     .then(function () { page.click('.vjs-big-play-button') }),
      //   page.waitForNavigation(),
      // ]);

    } catch(err) {
      console.log(err);
    }
    resolve(page)
    } catch(e) {
      console.log(e);
      await page.close();
      await launchPeer(id);
    }
  })
}

run();
