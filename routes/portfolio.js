var express = require('express')
var router = express.Router();
var fs = require('fs')
var Portfolio = require('../public/models/Portfolio.js')


router.get('/', function(req, res){
  Portfolio.find({}, function(err, data){
    var obj = {}
    var portfolio = data[0];

    res.send(data[0].currentPortfolio)
  })
})
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
