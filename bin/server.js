var express = require('express');
var app = express();
var bodyParser = require("body-parser");


const FayeServerSignaling = require('webrtc-p2p-cdn/src/server/fayeSignaling');

const clientPath = './web_app';
const p2pPath = './node_modules/webrtc-p2p-cdn/build/src';
const fayePath = './node_modules/faye/client';
const logPath = './logs/log.csv'
const fastcsv = require('fast-csv');
const fs = require('fs');

const port = process.env.PORT || 80;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(clientPath));
app.use(express.static(p2pPath));
app.use(express.static(fayePath));

// const signaling = new ServerSignaling();
var server = app.listen(port, function () {
  console.log('Example app listening on port '+port);
});
app.post('/logs',function(request,response){
  var body = request.body;
  console.log(body);
  const logHandle = fs.createWriteStream(logPath, { flags: 'a'});
  fastcsv
    .write(body, { headers: false, includeEndRowDelimiter: true })
    .pipe(logHandle);
  response.end("OK");
});

const fayeSignaling = new FayeServerSignaling(server);
// signaling.start(server);
