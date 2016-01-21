var express = require('express')
var router = express.Router();
var fs = require('fs')
var Portfolio = require('../public/models/Portfolio.js')
var request = require('request')
var CurrentPortfolio = require('../public/models/CurrentPortfolio')
var Firebase = require('firebase')
var userRef = new Firebase('https://optionsjs.firebaseio.com/users')
var portRef = new Firebase('https://optionsjs.firebaseio.com/port')

var keyID = 'andrew'

router.get('/', function(req, res){

  // get data from firebase
  userRef.child(keyID).once('value', function(snap){
    var data = snap.val()
    var updatedPortfolio = {}
    updatedPortfolio.currentPortfolio = {}


    if(data.currentPortfolio.options){

      var optionsArr = [];
      var optionsLength = Object.keys(data.currentPortfolio.options).length;
      updatedPortfolio.currentPortfolio.options = []
      for(var symbol in data.currentPortfolio.options){
        var requestObj  = {
          url: 'https://sandbox.tradier.com/v1/markets/options/chains?symbol=' + symbol +'&expiration=2016-02-19',
          headers: {
            Authorization: 'Bearer HVH53upmwGlLuyuc7WytGYxjtcax',
            Accept: 'application/json'
          }
        }
        request(requestObj, function(error, response, body){

          console.log('making options call')
          var symbol = JSON.parse(body).options.option[0].root_symbol;
          var symbolObj = {};
          symbolObj.symbol = symbol;

          symbolObj.chain = JSON.parse(body).options.option;
          // console.log(symbolObj);
          optionsArr.push(symbolObj)
          // console.log('')
          // console.log(optionsArr.length, 'arrLength', 'OL', optionsLength);
          if(portfolioArr.length == optionsLength){
            updatedPortfolio.name = 'Andrew Sturick'
            updatedPortfolio.currentPortfolio.options = optionsArr;
          }
        })
      }
    }
    var body = data.currentPortfolio.equities
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

      request(requestObj, function(error, response, body){

        var symbol = JSON.parse(body).options.option[0].root_symbol;
        var symbolObj = {};
        symbolObj.symbol = symbol;
        symbolObj.chain = JSON.parse(body).options.option;
        portfolioArr.push(symbolObj)
        if(portfolioArr.length == length){
          updatedPortfolio.name = 'Andrew Sturick'
          updatedPortfolio.currentPortfolio.equities = portfolioArr;


          // Update data in firebase
          portRef.set({updatedPortfolio})
          res.send('done')
        }
      })
    })
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
  var masterObj = {}
    split.map(function(line, i, arr){
      if (line == "Equities"){
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

        masterObj.name = "Andrew Sturick"
        masterObj.currentPortfolio = {}
        masterObj.currentPortfolio.equities = {};
        masterObj.currentPortfolio.equities=myPortfolio
        // Portfolio.create(obj, function(err, portfolio){
        // })
      }

      if(line ==="Options"){
        var optionsPositions = [];
        optionsPositionsObject = {};
        var headers = arr[i+1].split(',')
        var startingLine = i+2;
        var firstLineOfOptions = arr[startingLine];
        var totals = []
        for(var optionsLineIndex = 0 ; optionsLineIndex < 300; optionsLineIndex++){
          var currentLine = arr[startingLine + optionsLineIndex]
          var previousLine = arr[startingLine + optionsLineIndex - 1]
          if(currentLine){
            if( currentLine[0]==',' &&  previousLine[0]==','){
              var endLine= optionsLineIndex+ startingLine-1;
              for(var optionsLine = startingLine; optionsLine < endLine + 1; optionsLine++){
                if(arr[optionsLine][0]==","){
                  totals.push(arr[optionsLine])
                }
                if(arr[optionsLine][0]!=","){
                  var thisLine = arr[optionsLine].split(',')
                  var thisPosition = {};
                  for(header in headers){
                    if(headers[header]!='Mark Value')
                    thisPosition[headers[header]] = thisLine[header]
                  }
                  // console.log(thisPosition)
                  optionsPositions.push(thisPosition)
                };
              }
            }
          }
          }
          console.log('totalslog', totals)
          optionsPositions.map(function(position, i , arr){
            if(!optionsPositionsObject[position.Symbol]){
              optionsPositionsObject[position.Symbol] = {};
              optionsPositionsObject[position.Symbol].positions = []
            }
            optionsPositionsObject[position.Symbol].positions.push(position)
          })
          var  counter = 0
          for(position in optionsPositionsObject){
            optionsPositionsObject[position].totalBP = totals[counter]
            counter++
          }
          masterObj.currentPortfolio.options = {};
          masterObj.currentPortfolio.options = optionsPositionsObject;
        }
      })



      userRef.child(keyID).set(masterObj)

  });
  res.send(req.body)
})




module.exports = router;
