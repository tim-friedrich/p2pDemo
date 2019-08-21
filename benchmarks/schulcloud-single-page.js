const puppeteer = require('puppeteer');
const rootUrl = 'http://localhost:3100'

var browsers = [];
var pages = [];
var username = 'schueler@schul-cloud.org'
var password = 'Schulcloud1!'

function Sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function visitPage(url) {

}

async function run() {
  var page = await launchPeer();
  await signIn(page);
  await page.screenshot({path: '2.png', fullPage: true});
  var stats = await getStatistic();
  console.log("stats: ")
  console.log(stats)
  await teardown();
}

async function getStatistic() {
  return new Promise(async function(resolve, reject){
    pages[0].on('console', msg => console.log(msg.text()));
    await Sleep(10000);
    await pages[0].evaluate(() => {
      idbKeyval.get('swLogs').then(function(data) {
        console.log(JSON.stringify(data));
        resolve(data);
      })
    });
  })
}

async function teardown() {
  await Sleep(20000)
  for(var i = 0; i<browsers.length; i++) {
    await browsers[i].close();
  }
}

function launchPeer(){
  return new Promise(async function(resolve, reject){
    const browser = await puppeteer.launch({headless: true});
    browsers.push(browser);
    var page = await browser.newPage();
    await page.goto(rootUrl, {waitUntil: 'networkidle2'});
    pages.push(page)
    resolve(page)
  })
}

function signIn(page) {
  return new Promise(async function(resolve, reject) {
    await page.screenshot({path: '2.png', fullPage: true});
    await page.goto(rootUrl + '/login/')
    await page.type(".login-form [name=username]", username);
    await page.type(".login-form [name=password]", password);
    await page.screenshot({path: '2.png', fullPage: true});
    await page.click('.login-form [type="submit"]');
    await page.waitForNavigation();
    console.log('New Page URL:', page.url());
    resolve(page)
  })
}

run();
