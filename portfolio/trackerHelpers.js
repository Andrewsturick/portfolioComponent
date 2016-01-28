'use strict'
var request = require('request');
var yql = require('yql')





/////helper to helpers, not exported, organizes option chain by strike price
var combineOptionsAtSameStrikePrice = function(data){
  var strikeHolder = {};

  for(var line in data){
    data[line].numberStrike       = data[line].strike;
    var str                       = data[line].strike;
    str                           = str.toString().replace('.', '@');

    data[line].strike = str;
    strikeHolder[data[line].strike] ? addToStrike(data[line], strikeHolder)
    : makeNewStrike(data[line], strikeHolder)


    ////if strike already in object, add teh new call or put object
    function addToStrike(line, strikeHolder){
      sortCallsAndPuts(line)
    };

    ///if strike not already in object, make a new object for the strike THEN add the call or put
    function makeNewStrike(line, strikeHorder){
      strikeHolder[line.strike] = {};
      strikeHolder[line.strike].numberStrike = line.numberStrike;
      sortCallsAndPuts(line, [strikeHolder[line.strike]]);

    };

    ///sorts calls and puts for hte above functions
    function sortCallsAndPuts(line){
      if(line.option_type == "put"){
        strikeHolder[line.strike].put = line;
      }  else{
        strikeHolder[line.strike].call = line;
      };
    };
  }
  return strikeHolder;
};
//////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////


module.exports = {
////puts together queries for yql
  makeQuery : function(array){
    return array.map(function(stock ,index ,array){
      if(index==0){
        return '(' + stock
      }
      else{
        return ',' + stock
      }
    })
  },


  //makes request objects for optionsChains
  requestObj : function(symbol){
    this.url     =  'https://sandbox.tradier.com/v1/markets/options/chains?symbol=' + symbol +'&expiration=2016-02-19',
    this.headers =  {
      Authorization: 'Bearer evNx9FonKHOCFdNvR9XHd7z4FsZ9',
      Accept: 'application/json'
    }
    return this;
  },


  ///makes nice options chain object with calls and puts on same lines
  OptionsChainAndSymbolObject: function(symbol, body){
    var symbolObj = {};
    symbolObj.symbol = symbol;
    symbolObj.chain = JSON.parse(body).options.option;
    symbolObj.chain = combineOptionsAtSameStrikePrice(symbolObj.chain)
    return symbolObj
  },


  portfolioSymbolArray: function(optionsObj){
    var portfolioSymbolArray =[];
    for ( var position in optionsObj){
       portfolioSymbolArray.push( '"'  + position + '"')
    }
    return  portfolioSymbolArray
  }
}
