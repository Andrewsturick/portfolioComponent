'use strict'

var Firebase  = require('firebase')
var userRef   = new Firebase('https://optionsjs.firebaseio.com/users')
var portRef   = new Firebase('https://optionsjs.firebaseio.com/portfolio')

var trackerHelper = require('./trackerHelpers.js')

var YQL       = require('yql')
var request   = require('request')
var async     = require('async')
var keyID     = 'google:114353919215793249085'
var firebase  = require('firebase')
var portRef   = new Firebase('https://optionsjs.firebaseio.com/portfolio')

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
        var additions = []
        updatedPortfolio.map(function(obj){
          for(var stock in obj){
            additions.push(obj[stock])
          }
        })
        additions.map(function(stock){
          var stockRef = portRef.child(stock.symbol)
          stockRef.set(stock)
        })

      })



////////functions for async.parrallel\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/


      function options(data, cb){
        if(data.currentPortfolio.options){
          var counter = 0;
          var optionsObj    = {}
          var optionsLength = Object.keys(data.currentPortfolio.options).length;
          for(var symbol in data.currentPortfolio.options){
            var requestObj = new trackerHelper.requestObj(symbol)
            request(requestObj, function(error, response, body){
              counter      += 1
              var symbol    = JSON.parse(body).options.option[0].root_symbol;
              var symbolObj = new trackerHelper.OptionsChainAndSymbolObject(symbol, body)
              optionsObj[symbol] = symbolObj
              if(counter == optionsLength) {
                var portfolioSymbolArray = new trackerHelper.portfolioSymbolArray(optionsObj);
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
        if(data.currentPortfolio.equities){
        var counter = 0;
        var equitiesObj = {}
        var equitiesLength = Object.keys(data.currentPortfolio.equities).length;
          for(var symbol in data.currentPortfolio.equities){
            var requestObj = new trackerHelper.requestObj(symbol)
            request(requestObj, function(error, response, body){
              counter += 1
              var symbol = JSON.parse(body).options.option[0].root_symbol;
              var symbolObj = {};
              var symbolObj = new trackerHelper.OptionsChainAndSymbolObject(symbol, body)
              equitiesObj[symbol] = symbolObj
              if(counter == equitiesLength){
                var portfolioSymbolArray = new trackerHelper.portfolioSymbolArray(equitiesObj);
                var query     = new YQL('select * from yahoo.finance.quotes where symbol in (' + portfolioSymbolArray + ')');
                query.exec(function(err, data){
                  data.query.results.quote.map(function(quote, index, array){
                     equitiesObj[quote.Symbol]['currentQuote']  = quote;
                  })
                  // console.log(equitiesObj);
                cb(null, equitiesObj)
            })
          }
        })
      }
    }
  }})
}}
