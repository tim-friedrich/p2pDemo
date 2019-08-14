const puppeteer = require('puppeteer');

function Sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
var browsers = [];
var file = process.argv[2];
var pages = [];
(async() => {
  // await testBatches(3, 2, 20000)
  await testBandwidth();
  await Sleep(30000)
  for(var i = 0; i<browsers.length; i++) {
    await browsers[i].close();
  }
})();

function testBandwidth() {
  return new Promise(async function(resolve){
    // var pivot = await launchPeer()
    // await loadData(pivot);
    // await Sleep(60000);
    await testBatch(1, 1, 60000)
    await Sleep(20000);
    await testBatch(1, 1, 60000)

    // await closeBrowsers()
    // await Sleep(30000);
    //
    // await testBatch(1, 1, 60000)
    // await Sleep(30000);
    // await testBatch(1, 1, 60000)
    // browsers = []
    // await Sleep(60000);
    // await testBatches(10, 1, 40000);
    resolve()
  });
}

function closeBrowsers() {
  return new Promise(async function(resolve) {
    for(var d = 0; d<browsers.length; d++) {
      try {
        await pages[d].close();
        await browsers[d].close();
      } catch (e) {
        console.log(e);
      }
    }
    browsers = []
    resolve()
  });
}

function testBatches(numberBatches, batchSize, delay) {
  return new Promise(async function(resolve){
    for(var i=0; i<numberBatches; i++){
      console.log("running batch number: " + i);
      await testBatch(batchSize);
      // await Sleep(delay);
      // await closeBrowsers();
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
    await Sleep(10000)
    await loadData(batchPages);
    resolve();
  })
}

function launchPeer(){
  return new Promise(async function(resolve, reject){
    const browser = await puppeteer.launch({headless: true});
    browsers.push(browser);
    const page = await browser.newPage();
    await page.goto('http://localhost:8080', {waitUntil: 'networkidle2'});
    pages.push(page)
    resolve(page)
  })
}

function loadData(pages){
  return new Promise(async function(resolve, reject) {
    for(var i=0; i<pages.length; i++) {
      var page = pages[i];
      // await page.click('#btnDataSmall');
      var xhttp = await page.evaluate( function (file) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", file, true);
        xhttp.send();
        return xhttp;
      }, file)
      // xhttp.onreadystatechange = function() {
      //   if (xhttp.readyState === 4) {
      //     console.log("ready")
      //     if(i+1 >= pages.length){
      //       resolve();
      //     }
      //     // resolve();
      //     // if (times >= 0) {
      //     //   request_testfile(path, times-1)
      //     // }
      //   }
      // }
      // page.click('#btnDataBig');
      await Sleep(50000);
    }
    resolve()
  })
}
