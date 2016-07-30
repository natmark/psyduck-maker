var express = require('express');
var app = express();

// HTTPリクエストを受け取る部分
app.get('/', function (req, res) {
  　var buf = fs.readFileSync('./assets/Psyduck1.png');
   res.send(buf, { 'Content-Type': 'image/jpeg' }, 200);
   res.sendfile('./index.html', {root: __dirname })
});

// サーバーを起動する部分
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
