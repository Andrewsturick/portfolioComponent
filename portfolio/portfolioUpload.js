var Firebase = require('firebase')
var userRef = new Firebase('https://optionsjs.firebaseio.com/users')
var portRef = new Firebase('https://optionsjs.firebaseio.com/port')
var csvRef = new Firebase('https://optionsjs.firebaseio.com/csvs')


var request = require('request')

module.exports = {
  uploadPortfolio: function(req){

    csvRef.on('child_added', function(snap){
      var snap = snap.val()
      var data = snap.csv
      var keyID = snap.id

      if (data) {
        var split = data.split('\n');
        var equities = {};
        var futures = {};
        var options = {};
        var myPortfolio = {};
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
              myPortfolio[thisPosition.Symbol] = thisPosition
            }

            masterObj = {}
            masterObj.equities = {};
            masterObj.equities=myPortfolio
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
            var counter = 0
            for(position in optionsPositionsObject){
              optionsPositionsObject[position].totalBP = totals[counter]
              counter++
            }
            masterObj.options = {};
            masterObj.options = optionsPositionsObject;
          }
        })

        userRef.child(keyID).update({currentPortfolio: masterObj})
        csvRef.child(keyID).remove()
      }
    })
  }
}
