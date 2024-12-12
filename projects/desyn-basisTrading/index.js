const { getTvlFunction, chains } = require("../desyn-farm/helper");

module.exports = {
  doublecounted: true,
  methodology: 'Combines on-chain airdrops with stable returns from basis trading on Binance.',
}

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: getTvlFunction('strategy3', true)
  }
})