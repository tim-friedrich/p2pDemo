var express = require('express');
var app = express();
const ServerSignaling = require('webrtc-p2p-cdn/src/server/signaling');

const clientPath = './web_app';
const p2pPath = './node_modules/webrtc-p2p-cdn/build/src'
const port = process.env.PORT || 80;

app.use(express.static(clientPath));
app.use(express.static(p2pPath));
const signaling = new ServerSignaling();

var server = app.listen(port, function () {
  console.log('Example app listening on port '+port);
});

signaling.start(server);
