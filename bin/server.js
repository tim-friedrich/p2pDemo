var express = require('express');
var app = express();
const ServerSignaling = require('OpenHPI-P2P_CDN/src/server/signaling');

const clientPath = './web_app';
const p2pPath = './node_modules/OpenHPI-P2P_CDN/build/src'
const port = 8080;

app.use(express.static(clientPath));
app.use(express.static(p2pPath));
const signaling = new ServerSignaling();

var server = app.listen(port, function () {
  console.log('Example app listening on port '+port);
});

signaling.start(server);
