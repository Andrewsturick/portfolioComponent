'use strict'

var Firebase  = require('firebase')
var userRef   = new Firebase('https://optionsjs.firebaseio.com/users')
var portRef   = new Firebase('https://optionsjs.firebaseio.com/portfolio')

var trackerHelper = require('./trackerHelpers.js')

var YQL = require('yql')
var request   = require('request')
var async     = require('async')
var keyID     = 'google:114353919215793249085'




module.exports = {
  trackPortfolio: function(){
    userRef.child(keyID).once('value', function(snap){

      var data = snap.val()

      async.parallel([
        function(cb){
          options(data, cb);
        },
        function(cb){
          equities(data, cb);
        }
      ],
      function(err, updatedPortfolio){
        // console.log("PORTFOLIOOOOOOOOOOOOOOO", updatedPortfolio[1])
        portRef.set({
          options: updatedPortfolio[0],
          equities: updatedPortfolio[1]
        })
      })

      function options(data, cb){
        // console.log(data)
        var counter = 0;
        if(data.currentPortfolio.options){
          var optionsObj = {}
          var optionsLength = Object.keys(data.currentPortfolio.options).length;

          for(var symbol in data.currentPortfolio.options){
            var requestObj  = {
              url: 'https://sandbox.tradier.com/v1/markets/options/chains?symbol=' + symbol +'&expiration=2016-02-19',
              headers: {
                Authorization: 'Bearer evNx9FonKHOCFdNvR9XHd7z4FsZ9',
                Accept: 'application/json'
              }
            }
            console.log(requestObj);
            request(requestObj, function(error, response, body){
              // console.log(body)
              counter += 1
              var symbol = JSON.parse(body).options.option[0].root_symbol;
              var symbolObj = {};
              symbolObj.symbol = symbol;
              symbolObj.chain = JSON.parse(body).options.option;



              //combines calls and puts to one Object (strike price line)
              symbolObj.chain = trackerHelper.combineOptionsAtSameStrikePrice(symbolObj.chain)
              optionsObj[symbol] = symbolObj

              if(counter == optionsLength) {
                var portfolioSymbolArray =[];
                for ( var position in optionsObj){
                   portfolioSymbolArray.push( '"'  + position + '"')
                }
                var query     = new YQL('select * from yahoo.finance.quotes where symbol in (' + portfolioSymbolArray + ')');
                query.exec(function(err, data){
                  data.query.results.quote.map(function(quote, index, array){
                     optionsObj[quote.Symbol]['currentQuote']  = quote;
                  })
                cb(null, optionsObj)
              })
            }
          })
        }
      }}

      // 2
      function equities(data, cb){

        var counter = 0;
        var equitiesObj = {}
        equitiesObj.currentPortfolio = {}
        if(data.currentPortfolio.equities){

          var equitiesLength = Object.keys(data.currentPortfolio.equities).length;
          var body = data.currentPortfolio.equities
          var portfolioSecurities;

          for(var security in body){
            var symbol = body[security].Symbol.toUpperCase()
            var requestObj  = {
              url: 'https://sandbox.tradier.com/v1/markets/options/chains?symbol=' + symbol +'&expiration=2016-02-19',
              headers: {
                Authorization: 'Bearer evNx9FonKHOCFdNvR9XHd7z4FsZ9',
                Accept: 'application/json'
              }
            }

            request(requestObj, function(error, response, body){
              counter += 1
              var symbol = JSON.parse(body).options.option[0].root_symbol;
              var symbolObj = {};
              symbolObj.symbol = symbol;
              symbolObj.chain = JSON.parse(body).options.option;
              symbolObj.chain = trackerHelper.combineOptionsAtSameStrikePrice(symbolObj.chain)
              equitiesObj[symbol] = symbolObj



              if(counter == equitiesLength){
                var portfolioSymbolArray =[];
                for ( var position in equitiesObj){
                  // console.log(position);
                   portfolioSymbolArray.push( '"'  + position + '"')
                 }
                var query     = new YQL('select * from yahoo.finance.quotes where symbol in (' + portfolioSymbolArray + ')');
                query.exec(function(err, data){
                  // console.log(data.query.results.quote.length)
                  data.query.results.quote.map(function(quote, index, array){
                    equitiesObj[quote.Symbol]['currentQuote']  = quote;
                  })
                  cb(null, equitiesObj)
              })

          }
        })

      }
    }
  }})
}}
