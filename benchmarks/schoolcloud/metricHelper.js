const fs = require('fs');

const getTimeFromPerformanceMetrics = (metrics, name) =>
  metrics.metrics.find(x => x.name === name).value * 1000;

const extractDataFromPerformanceMetrics = (metrics, ...dataNames) => {
  const navigationStart = getTimeFromPerformanceMetrics(
    metrics,
    'NavigationStart'
  );

  const extractedData = {};
  dataNames.forEach(name => {
    extractedData[name] =
      getTimeFromPerformanceMetrics(metrics, name) - navigationStart;
  });

  return extractedData;
};
const urlTiming = function (tracing, name) {
  const resourceTracings = tracing.traceEvents.filter(
    x =>
      x.cat === 'devtools.timeline' &&
      typeof x.args.data !== 'undefined' &&
      typeof x.args.data.url !== 'undefined' &&
      x.args.data.url === name
  );
  const resourceTracingSendRequest = resourceTracings.find(
    x => x.name === 'ResourceSendRequest'
  );
  if(typeof resourceTracingSendRequest === 'undefined') {
    console.log("resourceTracingSendRequest not found: " + path);
    return { url: name, timing: -1 };
  }
  const resourceId = resourceTracingSendRequest.args.data.requestId;
  const resourceTracingEnd = tracing.traceEvents.filter(
    x =>
      x.cat === 'devtools.timeline' &&
      typeof x.args.data !== 'undefined' &&
      typeof x.args.data.requestId !== 'undefined' &&
      x.args.data.requestId === resourceId
  );
  const resourceTracingStartTime = resourceTracingSendRequest.ts / 1000;
  const resourceTracingEndTime =
    resourceTracingEnd.find(x => x.name === 'ResourceFinish').ts / 1000;
  return { url: name, timing: resourceTracingEndTime-resourceTracingStartTime }
}

const getUrlTimings = (path, urls) =>
new Promise(resolve => {
  fs.readFile(path, (err, data) => {
    result = []
    if(typeof data === 'undefined') {
      console.log("trace file not found: " + path);
      resolve([]);
      return;
    }
    const tracing = JSON.parse(data);
    for (var i = 0; i<urls.length; i+=1) {
      var res = urlTiming(tracing, urls[i])
      result.push(res);
    }
    resolve(result);
  });
});
const extractDataFromTracing = (path, name) =>
  new Promise(resolve => {
    fs.readFile(path, (err, data) => {

      if(typeof data === 'undefined') {
        resolve({
          start: -1,
          end: -1,
        });
        console.log("trace file not found: " + path);
        return;
      }
      const tracing = JSON.parse(data);

      const resourceTracings = tracing.traceEvents.filter(
        x =>
          x.cat === 'devtools.timeline' &&
          typeof x.args.data !== 'undefined' &&
          typeof x.args.data.url !== 'undefined' &&
          x.args.data.url === name
      );
      const resourceTracingSendRequest = resourceTracings.find(
        x => x.name === 'ResourceSendRequest'
      );
      if(typeof resourceTracingSendRequest === 'undefined') {
        resolve({
          start: -1,
          end: -1,
        });
        console.log("resourceTracingSendRequest not found: " + path);
        return;
      }
      const resourceId = resourceTracingSendRequest.args.data.requestId;
      const resourceTracingEnd = tracing.traceEvents.filter(
        x =>
          x.cat === 'devtools.timeline' &&
          typeof x.args.data !== 'undefined' &&
          typeof x.args.data.requestId !== 'undefined' &&
          x.args.data.requestId === resourceId
      );
      const resourceTracingStartTime = resourceTracingSendRequest.ts / 1000;
      const resourceTracingEndTime =
        resourceTracingEnd.find(x => x.name === 'ResourceFinish').ts / 1000;
      resolve({
        start: resourceTracingStartTime,
        end: resourceTracingEndTime,
      });
      // fs.unlink(path, () => {
      //
      // });
    });
  });

module.exports = {
  getTimeFromPerformanceMetrics,
  extractDataFromTracing,
  extractDataFromPerformanceMetrics,
  getUrlTimings
};
