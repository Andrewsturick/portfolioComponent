var express = require('express')
var router = express.Router();
var fs = require('fs')
var Portfolio = require('../public/models/Portfolio.js')
var request = require('request')
var CurrentPortfolio = require('../public/models/CurrentPortfolio')


router.get('/', function(req, res){
  Portfolio.find({}, function(err, data){
    var obj = {}
    var portfolio = data[0];
    var body = data[0].currentPortfolio
    var portfolioSecurities;
    var requestObj
    var portfolioArr = []
    var length = body.length
    body.map(function(security, index){
      var symbol = security.Symbol.toUpperCase()
      var requestObj  = {
        url: 'https://sandbox.tradier.com/v1/markets/options/chains?symbol=' + symbol +'&expiration=2016-02-19',
        headers: {
          Authorization: 'Bearer HVH53upmwGlLuyuc7WytGYxjtcax',
          Accept: 'application/json'
        }
      }
      // console.log(requestObj);
      request(requestObj, function(error, response, body){

        var symbol = JSON.parse(body).options.option[0].root_symbol;
        var symbolObj = {};
        symbolObj.symbol = symbol;
        symbolObj.chain = JSON.parse(body).options.option;
        portfolioArr.push(symbolObj)
        if(portfolioArr.length == length){
          var updatedPortfolio = {}
          updatedPortfolio.name = 'Andrew Sturick'
          updatedPortfolio.currentPortfolio = portfolioArr;
          console.log(updatedPortfolio);
          CurrentPortfolio.update({name:"Andrew Sturick"}, updatedPortfolio, function(err, response2){
            res.send('done')
          })
        }
      })
    })
  })})

router.put('/', function(req, res){
  fs.readFile(req.body.file, 'utf8', function(err, data){
  var split = data.split('\n');
  var equities = {};
  var futures = {};
  var options = {};
  var myPortfolio = [];
  var headers;
    split.map(function(line, i, arr){
      if (line == "Equities" || line=="Options"){
        var thisSecurity =line;
        headers = arr[i+1].split(',');
        for(var a = i; a< 150; a++){
          if(arr[a]==""){
            var end = a-1;
            break
          }
        }
        for(var e = i+2; e< end; e++){
          var thisLine = arr[e].split(',');
          equities[thisLine[0]]=thisLine;
        }

        for (position in equities){
          var thisPosition  = {}
          for (header in headers){
            if (headers[header]==='Mark Value'){continue}
            else{
              thisPosition[headers[header]] = equities[position][header]
            }
          }
          myPortfolio.push(thisPosition)
        }
        var obj = {};
        obj.name = "Andrew Sturick"
        obj.currentPortfolio=myPortfolio
        Portfolio.create(obj, function(err, portfolio){
        })
      }
    })
  });
  res.send(req.body)
})




module.exports = router;
