var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var session = require('express-session')


const FayeServerSignaling = require('webrtc-p2p-cdn/src/server/fayeSignaling');

const clientPath = './public';
const p2pPath = './node_modules/webrtc-p2p-cdn/build/src';
const fayePath = './node_modules/faye/client';
const logPath = './logs/log.csv'
const fastcsv = require('fast-csv');
const fs = require('fs');

const port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(clientPath));
app.use(express.static(p2pPath));
app.use(express.static(fayePath));
app.set('view engine', 'ejs');
app.set('trust proxy', 1) // trust first proxy
var MemoryStore = session.MemoryStore;
var sessionStore = new MemoryStore();
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: sessionStore}))

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// const signaling = new ServerSignaling();
var server = app.listen(port, function () {
  console.log('Example app listening on port '+port);
});

app.get("/session", function(req, res){
  console.log("sessionId: " + req.sessionID.length)
  sessionStore.get(req.sessionID, function(err, data) {
    if(data) data.sessionID = req.sessionID;
    res.send({err: err, data:data});
  });
});

app.get('/', function(req, res) {
  console.log('Success');
  console.log("session id:"+ req.sessionID);
  var sessionID = req.sessionID;
  res.render('index', { sessionID: sessionID });
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

app.get('/logs', function(request,response) {
  response.download('./logs/log.csv')
})

const fayeSignaling = new FayeServerSignaling(server);
// signaling.start(server);
