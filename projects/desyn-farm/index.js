const { getTvlFunction, chains } = require("./helper");

module.exports = {
  methodology: 'Focused on airdrops from DeSyn and new chains.',
}

chains.forEach(chain => {
  module.exports[chain] = {
    // rest api type:: StrategyType1
    tvl: getTvlFunction('StrategyType1', false)
  }
})