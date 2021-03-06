// Flux Home configuration
const path = require('path');
const express = require('express');
const compression = require('compression');

const home = path.join(__dirname, '../ZelFront/dist');

const homeApp = express();
homeApp.use(compression);
homeApp.use(express.static(home));

homeApp.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

homeApp.get('*', (req, res) => {
  res.sendFile(path.join(home, 'index.html'));
});

homeApp.listen(16126);
