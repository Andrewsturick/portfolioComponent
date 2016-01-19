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

app.get('/', function(req,res){
  res.sendfile('index.html');
});
function hitAPI(){
  setTimeout(function(){
    request('http://localhost:3000/portfolio',function(error, response, body){
      //clear portfolio object
      var portfolio = [];
      var obj = JSON.parse(body);
      for(var stock in obj){
          var symbol = (obj[stock].Symbol).toUpperCase();
          var url = 'https://sandbox.tradier.com/v1/markets/options/chains?symbol=' + symbol+'&expiration=2016-02-19'
          var requestObj = {
            url: url,
            headers: {
              Authorization: `Bearer HVH53upmwGlLuyuc7WytGYxjtcax`,
              Accept: 'application/json'
            }
          };
         request(requestObj, function(err, res, body){
          var obj = {};
          obj.symbol = JSON.parse(body).options.option[0].root_symbol
          obj.chain = [];
          var chain = JSON.parse(body).options.option;

          for(var option in chain){

          obj.chain.push(chain[option])
          }

          portfolio.push(obj)
          console.log('PORTFOLIO',portfolio);
        })
      }

      hitAPI()
     })
  }, 10000)
}
hitAPI()
app.listen(PORT);
