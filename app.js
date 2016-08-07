var express = require('express');
var app = express();
var fs = require('fs');
var OAuth = require('oauth').OAuth;
var session = require('express-session'); // 追加
var qs = require('querystring');
var request = require('request');
var url = require('url');

app.set('port', process.env.PORT || 3000);

//session setting
app.use(session({
     secret : 'hogehoge',
     resave : true,
     saveUninitialized : true,
}));

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
/*サーバリソースをクライアント側で利用*/
app.get('/assets/*', function (req, res){
  console.log(req.url);
  var contentType = '';

  fs.readFile('.' + req.url, 'binary',
      function (err, data) {
          res.writeHead(200, {'Content-Type':getContentType(getExtention(req.url))});
          res.write(data, 'binary');
          res.end();
      }
  );
});


var oa = new OAuth (
  "https://api.twitter.com/oauth/request_token",
  "https://api.twitter.com/oauth/access_token",
  "IiDu8ZglXLmmsZPUDIvknPXSk", //twitter appで発行されたConsumer keyを入力。
  "oEUb229L7F50ZTrNeMh4yVnrw7tbbPPSF8Tqlyl075UgRS3MBY", //twitter appで発行されたConsumer secretを入力。
  "1.0",
  "https://psyduck-maker.herokuapp.com/auth/twitter/callback",
  "HMAC-SHA1"
);
//auth/twitterにアクセスするとTwitterアプリケーション認証画面に遷移します。
app.get('/auth/twitter/', function(req, res){
  oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
    if (error) {
      console.log(error);
      res.send("yeah no. didn't work.");
    } else {
      req.session.oauth = {};
      req.session.oauth.token = oauth_token;
      console.log('oauth.token: ' + req.session.oauth.token);
      req.session.oauth.token_secret = oauth_token_secret;
      console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
      res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token);
    }
  });
});
app.get('/tweet', function(req, res, next){
  oa.post(
    "https://upload.twitter.com/1.1/media/upload.json",
    req.session.oauth.access_token,
    req.session.oauth.access_token_secret,
    {"media_data":req.session.twData.imgData.split(",")[1]},
    function(error, data) {
      if(error) console.log(require('sys').inspect(error))
      else{
        var parsedData = JSON.parse(data);
        var media_ids = parsedData.media_id_string;
        oa.post(
          "https://api.twitter.com/1.1/statuses/update.json",
          req.session.oauth.access_token,
          req.session.oauth.access_token_secret,
          {"status":req.session.twData.tweet,"media_ids":media_ids},
          function(error, data) {
            if(error) console.log(require('sys').inspect(error))
            else{
              res.redirect('/result.html?text='+req.session.twData.imgText+'&image='+req.session.twData.imgName);
            }
          }
        );
      }
    }
  );
});
app.get('/auth/twitter/callback', function(req, res, next){
  console.log("callback");
  if (req.session.oauth) {
    req.session.oauth.verifier = req.query.oauth_verifier;
    var oauth = req.session.oauth;
    oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier,
    function(error, oauth_access_token, oauth_access_token_secret, results){
      req.session.oauth.access_token = oauth_access_token;
      req.session.oauth.access_token_secret = oauth_access_token_secret;
      if (error){
        console.log(error);
        res.send("yeah something broke.");
      } else {
        res.redirect('https://psyduck-maker.herokuapp.com/tweet');
      }
    });
  } else {
    next(new Error("you're not supposed to be here."));
  }
});

app.post('/post', function (req, res) {
  var body='';
   req.on('data', function (data) {
       body +=data;
   });
   req.on('end',function(){
       var POST =  qs.parse(body);
       req.session.twData = {};
       req.session.twData.tweet = unescape(POST.tweet);
       req.session.twData.imgData = unescape(POST.binary);
       req.session.twData.imgName = unescape(POST.imgSrc);
       req.session.twData.imgText = unescape(POST.text);
       res.redirect('https://psyduck-maker.herokuapp.com/auth/twitter/')
   });
});

app.listen(app.get('port'));
console.log('running on ' + app.get('port'));

function getContentType(expanded){
  if(expanded == 'png') return 'image/png'
  if(expanded == 'jpeg') return 'image/jpeg'
  if(expanded == 'gif') return 'image/gif'
  if(expanded == 'ico') return 'image/x-icon'
  if(expanded == 'css') return 'text/css'
}
function getExtention(url) {
    var ext = url.replace(/\?.*$/, "")          // 拡張子以降のパラメータを除去
                 .replace(/#.*$/, "")           // 拡張子以降のパラメータを除去
                 .replace(/^.*\.(.+)$/, "$1");  // 拡張子部分（最後の.以降）をキャプチャして置換
    return ext;
}
