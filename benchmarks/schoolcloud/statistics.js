const puppeteer = require('puppeteer');
var fs = require("fs");
const helper = require('./helper');
var metrics = require('./metricHelper');
module.exports = function(peer){
  this.peer = peer;
  this.page = peer.page;
  this.peerId = peer.peerId;
  this.client;
  this.runNum = 1;
  this.requests = [];
  //this.performanceMetrics;
  this.tracePath = './traces/trace_' + this.peerId + '.json';
  this.measureNavigation = async function() {
    // const performanceTiming = await page.evaluate(() => window.performance.timing);
    // domInteractive
    // navigationStart
    //
    // var performanceMetrics = await this.client.send('Performance.getMetrics');
    // console.log(performanceMetrics)
    // var res = metrics.extractDataFromPerformanceMetrics(
    //   performanceMetrics,
    //   'FirstMeaningfulPaint'
    // );
    // console.log(res)
  }
  this.start = async function () {
    this.client = await this.page.target().createCDPSession();
    await this.client.send('Network.enable');
    await this.client.send('Performance.enable');


    await this.page.tracing.start({ path: this.tracePath});
    this.peer.clientData = await this.page.evaluate(function () {
      var result = {}
      result.sessionId = p2pCDN.peer.peerId;
      result.channel = p2pCDN.peer.channel;
      return result
    })
    this.peer.requests = []
    function logRequest(interceptedRequest) {
      this.peer.requests.push(interceptedRequest.url());
    }
    this.page.on('response', logRequest.bind(this));

    // turbolinks:load fires once after the initial page load, and again after every
    // Turbolinks visit. Access visit timing metrics with the event.data.timing object.
    // await this.page.evaluate(async () => {
    await this.page.evaluateOnNewDocument(async () => {
      document.addEventListener("turbolinks:load", async function (e) {
        var entry = {};
        var timing = e.data.timing;
        if(typeof timing.visitStart === 'undefined') {
          entry.turbolinks = false
          var performanceTiming = window.performance.timing;
          var interactive = performanceTiming.domInteractive - performanceTiming.navigationStart
          var loadEventStart = performanceTiming.loadEventStart - performanceTiming.navigationStart
          var loadEventEnd = performanceTiming.loadEventEnd - performanceTiming.navigationStart
          var domContentLoadedEventStart = performanceTiming.domContentLoadedEventStart - performanceTiming.navigationStart
          // domInteractive domContentLoadedEventStart
          // navigationStart
          entry.interactive = interactive;
          entry.loadEventEnd = loadEventEnd
          entry.domContentLoadedEventStart = domContentLoadedEventStart;
          entry.loadEventStart = loadEventStart;
          // entry.performanceTimings = performanceTiming;
        }
        entry.url = e.data.url;
        entry.timings = timing;
        var navs = await idbKeyval.get('navigations');
        if(typeof navs === 'undefined') {
          navs = []
        }
        entry.visitTiming = timing.visitEnd-timing.visitStart;
        entry.requestTimings = timing.requestEnd-timing.requestStart;
        navs.push(entry)
        idbKeyval.set('navigations', navs)
      })
    })

    console.log("Started statistic gathering for: " + this.peerId)
  }
  this.peerStats = async function () {
    var result = {}
    await this.gatherSwPageStatistics();
    result.peerId = this.peer.peerId;
    result.timeout = this.peer.timeout;
    result.clientData = this.peer.clientData;
    //result.requests = this.peer.requests;
    result.swStats = this.peer.swStats;
    result.requestTimings = await this.requestTimings();

    return result
  }
  this.requestTimings = async function () {
    var result = []
    for(var i=0; i < this.peer.requests.length; i+=1) {
      var url = this.peer.requests[i];
      const tracing = await metrics.extractDataFromTracing(
        this.tracePath,
        url
      );
      result.push({url: url, timing: tracing.end-tracing.start});
    }
    return result;
  }
  this.stop = async function () {
    // console.log(this.client.metrics());
    // this.gatherSwStatistics();
    await this.page.tracing.stop()
    console.log("Stopped statistic gathering for: " + this.peerId)
  }
  this.gatherSwPageStatistics = async function () {
    // TODO: multi client support
    // var contents = "[]"
    // var filepath = "./logs/SwLogs.json"
    //  // fs.readFileSync(filepath);
    // contents = fs.readFile(filepath, function (err, data) {
    //     if (err) return console.error(err);
    //     console.log(data.toString());
    // });
    // if(typeof contents === 'undefined') contents = "[]"
    // var swStats = JSON.parse(contents);
    // console.log(swStats)
    // var result =
    // pages[0].on('console', msg => console.log(msg.text()));
    // await helper.sleep(10000);
    var pageStats = await this.page.evaluate(async () => {
      return await idbKeyval.get('swLogs');
    });
    var loadingTimes = await this.page.evaluate(async () => {
      return await idbKeyval.get('navigations');
    });
    // console.log(loadingTimes)
    this.peer.loadingTimes = loadingTimes;
    this.peer.swStats = pageStats;

    // for(var i = 0; i < pages.length; i+=1) {
    //   var pageStats = await pages[i].evaluate(async () => {
    //     return await idbKeyval.get('swLogs');
    //   });
      // console.log(pageStats)
      // if(typeof pageStats === 'undefined') {
      //   await pages[i].screenshot({path: '2.png', fullPage: true});
      //   await _sleep(1200000);
      // }
      // result = result.concat(pageStats);
    // }
    // swStats = swStats.concat(pageStats)
    // fs.writeFile(filepath, JSON.stringify(swStats))
    // fs.close()
    // console.log(pageStats)
    return pageStats;
  }
}
