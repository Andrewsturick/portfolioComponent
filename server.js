'use strict';

var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var request = require('request')

var app = express();
var PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/myPortfolioDirective')


app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.use('/portfolio', require('./routes/portfolio'))
app.use('/hello', require('./routes/hello'))
app.get('/', function(req,res){
  res.sendfile('index.html');
});

function hitAPI(){
  setTimeout(function(){
    request('http://localhost:3000/portfolio',function(error, response, body){
      console.log(body)
      hitAPI()
     })
  }, 3000)
}
hitAPI()
app.listen(PORT);
