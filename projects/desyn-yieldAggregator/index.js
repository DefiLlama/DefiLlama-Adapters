const { getTvlFunction } = require("../desyn-farm/helper");

module.exports = {
  doublecounted: true,
  methodology: 'Engages with DeFi protocols like Lending, DEX, and Restaking, offering both airdrops and structured yield options.',
}

const chains = ["ethereum", "arbitrum", "btr", "mode", "zklink", "core", "ailayer", "linea", "merlin", "scroll"];


chains.forEach(chain => {
  module.exports[chain] = {
    tvl: getTvlFunction('StrategyType2', true)
  }
})