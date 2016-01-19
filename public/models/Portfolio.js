var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var portfolioSchema = Schema({
  name: String,
  currentPortfolio : []
})





Portfolio = mongoose.model('Portfolio', portfolioSchema);
module.exports = Portfolio;
