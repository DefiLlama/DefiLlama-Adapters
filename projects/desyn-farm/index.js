const { getTvlFunction, chains } = require("./helper");

module.exports = {
  hallmarks: [
    [1719734400, "Launched on Merlin Chain"],
    [1718092800, "DeSyn KelpDAO Restaking Fund Launched"],
    [1713340800, "Restaking Fund Series Launched"]
  ],
  methodology: 'Focused on airdrops from DeSyn and new chains.',
}

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: getTvlFunction('StrategyType1', false)
  }
})