const { getTvlFunction, chains } = require("../desyn-farm/helper");

module.exports = {
  doublecounted: true,
  methodology: 'Engages with DeFi protocols like Lending, DEX, and Restaking, offering both airdrops and structured yield options.',
}

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: getTvlFunction('StrategyType2', true)
  }
})