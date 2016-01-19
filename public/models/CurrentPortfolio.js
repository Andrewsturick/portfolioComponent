var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var CurrentPortfolioSchema = Schema({
  name: String,
  currentPortfolio : []
})





CurrentPortfolio = mongoose.model('CurrentPortfolio', CurrentPortfolioSchema);
module.exports = CurrentPortfolio;
