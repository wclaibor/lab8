var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
var app = express();
var basicAuth = require('basic-auth-connect');
var auth = basicAuth(function(user, pass) {
    return((user ==='cs360')&&(pass === 'test'));
  });
app.use(bodyParser());
var options = {
    host: '127.0.0.1',
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
};
  http.createServer(app).listen(80);
  https.createServer(options, app).listen(443);
  app.use('/', express.static('./html', {maxAge: 60*60*1000}));
  app.get('/getcity.cgi', function (req, res) {
    //console.log("in get city");
    fs.readFile('html/cities.dat.txt', function (err, data) {
    if(err) throw err;
    cities = data.toString().split("\n");
    var myReg = new RegExp("^"+req.query["q"],"i");
    //console.log(myReg);
    var jsonresult = [];
    for(var i=0; i<cities.length; i++) {
      var result = cities[i].search(myReg);
      if(result != -1) {
     //   console.log(cities[i]);
	jsonresult.push({city:cities[i]});
      }
    //  console.log(cities[i]);
    //  console.log(jsonresult);
    }
    res.status(200);
    res.json(jsonresult);
    res.end();
     });
  });
  app.get('/', function (req, res) {
    //console.log("in index");
    res.send("Get Index");
  });
  app.get('/comments', function(req,res) {
    //console.log("In comment route");
    var MongoClient = require('mongodb').MongoClient;
      MongoClient.connect("mongodb://localhost/weather",function(err,db) {
	if(err) throw err;
	db.collection("comments",function(err,comments) {
	  if(err) throw err;
	  comments.find(function(err,items) {
	    items.toArray(function(err,itemArr) {
	     // console.log("Document Array: ");
	     // console.log(itemArr);
              res.json(itemArr);
	    });
  	  });
	});
      });
  });
  app.post('/comment', auth, function(req,res) {
    //console.log("In POST comment route");
    //console.log(req.body.Name);
    //console.log(req.body.Comment);
    console.log(req.user);
    console.log("remote user");
    console.log(req.remoteUser);
    var MongoClient = require('mongodb').MongoClient;
    MongoClient.connect("mongodb://localhost/weather", function(err,db) {
      if(err) throw err;
      //console.log("about to add");
      db.collection('comments').insert(req.body,function(err,records) {
        //console.log("Record added as "+records[0]._id);
      });
    });
    res.end();
  });

