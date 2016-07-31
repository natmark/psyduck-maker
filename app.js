var express = require('express');
var app = express();
var fs = require('fs');

app.get('/', function (req, res) {
  fs.readFile('./index.html', 'UTF-8',
      function (err, data) {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.write(data);
          res.end();
      }
  );
});
app.get('/index.html', function (req, res) {
  fs.readFile('./index.html', 'UTF-8',
      function (err, data) {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.write(data);
          res.end();
      }
  );
});
app.get('/result.html?*', function (req, res) {
  console.log("result");
  fs.readFile('./result.html', 'UTF-8',
      function (err, data) {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.write(data);
          res.end();
      }
  );
});
app.get('/Psyduck[1-9]+.png', function (req, res) {
  console.log(req.url);
  fs.readFile('./assets' + req.url, 'binary',
      function (err, data) {
          res.writeHead(200, {'Content-Type': 'image/png'});
          res.write(data, 'binary');
          res.end();
      }
  );
});
app.get('/Psyduck-logo.png', function (req, res) {
  fs.readFile('./assets/Psyduck-logo.png', 'binary',
      function (err, data) {
          res.writeHead(200, {'Content-Type': 'image/png'});
          res.write(data, 'binary');
          res.end();
      }
  );
});


app.listen(process.env.PORT || 3000);
