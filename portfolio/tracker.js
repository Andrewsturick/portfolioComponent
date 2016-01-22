'use strict'

var Firebase  = require('firebase')
var userRef   = new Firebase('https://optionsjs.firebaseio.com/users')
var portRef   = new Firebase('https://optionsjs.firebaseio.com/portfolio')

var trackerHelper = require('./trackerHelpers.js')

var YQL = require('yql')
var request   = require('request')
var async     = require('async')
var keyID     = 'andrew'




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
        portRef.set({
          options: updatedPortfolio[0].currentPortfolio.options,
          equities: updatedPortfolio[1].currentPortfolio.equities
        })
      })

      function options(data, cb){
        if(data.currentPortfolio.options){
          var optionsObj = {}
          optionsObj.currentPortfolio = {}

          var optionsArr = [];
          var optionsLength = Object.keys(data.currentPortfolio.options).length;

          for(var symbol in data.currentPortfolio.options){
            var requestObj  = {
              url: 'https://sandbox.tradier.com/v1/markets/options/chains?symbol=' + symbol +'&expiration=2016-02-19',
              headers: {
                Authorization: 'Bearer evNx9FonKHOCFdNvR9XHd7z4FsZ9',
                Accept: 'application/json'
              }
            }
            request(requestObj, function(error, response, body){

              var symbol = JSON.parse(body).options.option[0].root_symbol;
              var symbolObj = {};
              symbolObj.symbol = symbol;
              symbolObj.chain = JSON.parse(body).options.option;


              //combines calls and puts to one Object (strike price line)
              symbolObj.chain = trackerHelper.combineOptionsAtSameStrikePrice(symbolObj.chain)
              optionsArr.push(symbolObj)
              if(optionsArr.length == optionsLength){
                optionsObj.name = 'Andrew Sturick'
                optionsObj.currentPortfolio.options = optionsArr;
                var portfolioSymbolArray = optionsArr.map(function(position){
                  return '"'  + position.symbol + '"'
                })


                var query     = new YQL('select * from yahoo.finance.quotes where symbol in (' + portfolioSymbolArray + ')');

                query.exec(function(err, data){
                  data.query.results.quote.map(function(quote, index, array){
                     optionsObj.currentPortfolio.options[index]['currentQuote']  = quote;
                  })
                  cb(null, optionsObj)
                })
                // console.log('options', optionsObj)
              }
            })
          }
        }
      }

      // 2
      function equities(data, cb){
        var equitiesObj = {}
        equitiesObj.currentPortfolio = {}
        if(data.currentPortfolio.equities){
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
                Authorization: 'Bearer evNx9FonKHOCFdNvR9XHd7z4FsZ9',
                Accept: 'application/json'
              }
            }

            request(requestObj, function(error, response, body){
              var symbol = JSON.parse(body).options.option[0].root_symbol;
              var symbolObj = {};
              symbolObj.symbol = symbol;
              symbolObj.chain = JSON.parse(body).options.option;
              symbolObj.chain = trackerHelper.combineOptionsAtSameStrikePrice(symbolObj.chain)

              portfolioArr.push(symbolObj)
              if(portfolioArr.length == length){
                equitiesObj.name = 'Andrew Sturick'
                equitiesObj.currentPortfolio.equities = portfolioArr;

                var portfolioSymbolArray = portfolioArr.map(function(position){
                  return '"'  + position.symbol + '"'
                })


                var query     = new YQL('select * from yahoo.finance.quotes where symbol in (' + portfolioSymbolArray + ')');

                query.exec(function(err, data){
                  data.query.results.quote.map(function(quote, index, array){
                     equitiesObj.currentPortfolio.equities[index]['currentQuote']  = quote;
                  })
                  cb(null, equitiesObj)
                })
              }
            })
          })
        }
      }
    })
  }
}
