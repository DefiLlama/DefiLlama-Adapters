const { getTvlFunction } = require("../desyn-farm/helper");

module.exports = {
  doublecounted: true,
  methodology: 'Combines on-chain airdrops with stable returns from basis trading on Binance.',
}

const chains = ["ethereum", "arbitrum", "btr", "mode", "zklink", "core", "ailayer", "linea", "merlin", "scroll"];

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: getTvlFunction('StrategyType3', true)
  }
})