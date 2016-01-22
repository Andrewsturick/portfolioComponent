'use strict'
var request = require('request');
var yql = require('yql')

module.exports = {
  combineOptionsAtSameStrikePrice : function(data){
      var strikeHolder = {};


      //////see below three comments
      for(var line in data){
          data[line].numberStrike       = data[line].strike;
          var str                       = data[line].strike;
          str                           = str.toString().replace('.', '@');

          data[line].strike = str;
          strikeHolder[data[line].strike] ? addToStrike(data[line], strikeHolder)
                                          : makeNewStrike(data[line], strikeHolder)
      };


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
      return strikeHolder;
  },



  makeQuery : function(array){
    return array.map(function(stock ,index ,array){
      if(index==0){
        return '(' + stock
      }
      else{
        return ',' + stock
      }
    })
  }
}
