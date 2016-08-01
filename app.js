var express = require('express');
var app = express();
var fs = require('fs');
var OAuth = require('oauth').OAuth;
var session = require('express-session'); // 追加
var qs = require('querystring');

app.set('port', process.env.PORT || 3000);

var session = require('express-session');
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

var oa = new OAuth (
  "https://api.twitter.com/oauth/request_token",
  "https://api.twitter.com/oauth/access_token",
  "IiDu8ZglXLmmsZPUDIvknPXSk", //twitter appで発行されたConsumer keyを入力。
  "oEUb229L7F50ZTrNeMh4yVnrw7tbbPPSF8Tqlyl075UgRS3MBY", //twitter appで発行されたConsumer secretを入力。
  "1.0",
  "http://127.0.0.1:3000/auth/twitter/callback",
  "HMAC-SHA1"
);
//auth/twitterにアクセスするとTwitterアプリケーション認証画面に遷移します。
app.get('/auth/twitter', function(req, res){
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

app.get('/auth/twitter/callback', function(req, res, next){
  if (req.session.oauth) {
    req.session.oauth.verifier = req.query.oauth_verifier;
    var oauth = req.session.oauth;
    oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier,
    function(error, oauth_access_token, oauth_access_token_secret, results){
      if (error){
        console.log(error);
        res.send("yeah something broke.");
      } else {
        req.session.oauth.access_token = oauth_access_token;
        req.session.oauth.access_token_secret = oauth_access_token_secret;
        console.log(results);
        fs.readFile('./Tweet.html', 'UTF-8',
            function (err, data) {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(data);
                res.end();
            }
        );
      }
    });
  } else {
    next(new Error("you're not supposed to be here."));
  }
});
app.post('/post', function (req, res) {
  if(req.session.oauth && req.session.oauth.access_token) {
    var body = '';
    req.on('data', function (data) {
      body +=data;
    });
    req.on('end',function(){
       var POST =  qs.parse(body);
       var text = POST.text;
       oa.post(
     "https://api.twitter.com/1.1/statuses/update.json",
     req.session.oauth.access_token,
     req.session.oauth.access_token_secret,
     {"status":text},
     function(error, data) {
       if(error) console.log(require('sys').inspect(error))
       else console.log(data)
     }
   );
    });
  } else {
    res.send('fail.');
  }
});

app.listen(app.get('port'));
console.log('running on ' + app.get('port'));
