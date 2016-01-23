var express = require('express')
var router = express.Router();
var CurrentPortfolio = require('../public/models/CurrentPortfolio')

var position = require('../portfolio/portfolioUpload.js')
var tracker = require('../portfolio/tracker.js')

router.get('/', function(req, res){
  // send user data from front
  tracker.trackPortfolio()
  res.send("done")
})

module.exports = router;
