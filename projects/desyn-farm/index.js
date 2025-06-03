const { getTvlFunction, chains } = require("./helper");

module.exports = {
  hallmarks: [
    [1719734400, "Launched on Merlin Chain"],
  ],
  methodology: 'Focused on airdrops from DeSyn and new chains.',
}

chains.forEach(chain => {
  module.exports[chain] = {
    // rest api type:: StrategyType1
    tvl: getTvlFunction('StrategyType1', false)
  }
})