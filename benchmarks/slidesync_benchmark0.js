const puppeteer = require('puppeteer');
const rootUrl = 'https://staging.slidesync.com/YqBa7G8kpW'

// var browsers = [];
var pages = [];
var numberOfPeers = 25;
var browser;
var browsers = [];
function Sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function visitPage(page, path) {
  await page.goto(rootUrl+path, {waitUntil: 'networkidle2'});
}

async function run() {
  console.log("Starting test run")
  //browser = await puppeteer.launch({headless: false, executablePath: 'google-chrome'});
  // browser = await puppeteer.launch({headless: false, executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome'});
  for (var i=0; i < numberOfPeers; i+=1) {
    console.log("launching Peer " + (i+1));
    launchPeer(i);
    await Sleep(1000)
  }
  await Sleep(10000);

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
    try {
      // const browser = await puppeteer.launch({headless: true, executablePath: 'google-chrome'});
    // const context = await browser.createIncognitoBrowserContext();
    // var _browser = await puppeteer.launch({headless: false, executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome'});
    var _browser = await puppeteer.launch({headless: true, executablePath: 'google-chrome'});
    browsers.push(_browser);

    // var page = await context.newPage()
    var page = (await _browser.pages())[0];
    await page.goto(rootUrl, {waitUntil: 'networkidle2'});
    pages.push(page);
    try {
      // await Sleep(5000);
      page.on('framenavigated', function() {
        console.log("navigated")
      })
      page.evaluate(function () {
        var a;
        Turbolinks = a;
        var pressButtons = function () {
          console.log("init pressButtons")
          setTimeout(function() {

            var playButton = $('.vjs-play-control');
            var is_playing = $(".vjs-play-control.vjs-control.vjs-playing").length >=1
            console.log("try playButton")
            if(!is_playing) {
              playButton.click();
              console.log("clicked Play Button")
              $('.vjs-menu-button-levels').click();

            }
            var resSelect = $('.vjs-menu-content').children().last();
            if(resSelect.length >= 1) {
              console.log("Selected Resolution")
              resSelect.click();
            }
            pressButtons();
          }, 1000)
        }
        pressButtons();
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
