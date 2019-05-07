const puppeteer = require('puppeteer');

function Sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
var browsers = [];
// var pages = [];
var numPeers = 10;
(async() => {
  testBatches(10,2,10000)
  await Sleep(20000)
  for(var i = 0; i<browsers.length; i++) {
    await browsers[i].close();
  }
})();

function testBatches(numberBatches, batchSize, delay) {
  return new Promise(async function(resolve){
    for(var i=0; i<numberBatches; i++){
      console.log("running batch number: "+(i+1));
      testBatch(batchSize);
      await Sleep(delay);
    }
    resolve();
  })
}

function testBatch(size) {
  new Promise(async function(resolve){
    var batchPages = []
    for(var i=0; i<size; i++) {
      batchPages.push(await launchPeer());
    }
    loadData(batchPages);
    resolve();
  })
}

function launchPeer(){
  return new Promise(async function(resolve, reject){
    const browser = await puppeteer.launch({headless: true});
    browsers.push(browser);
    const page = await browser.newPage();
    await page.goto('http://localhost:8080', {waitUntil: 'networkidle2'});
    resolve(page)
  })
}

function loadData(pages){
  return new Promise(async function(resolve, reject) {
    for(var i=0; i<pages.length; i++) {
      var page = pages[i];
      // await page.click('#btnDataSmall');
      await page.click('#btnDataBig');
    }
    resolve()
  })
}
