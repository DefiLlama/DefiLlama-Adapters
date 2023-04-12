const { nullAddress, sumTokensExport, } = require('../helper/unwrapLPs');

const config = {
  ethereum: [
    [[nullAddress], '0x882260324AD5A87bF5007904B4A8EF87023c856A'], // ETH
    [['0xdAC17F958D2ee523a2206206994597C13D831ec7', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'], '0x0de7b091A21BD439bdB2DfbB63146D9cEa21Ea83'] // USDT,USDC
  ]
}
module.exports = {};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: sumTokensExport({ ownerTokens: config[chain] }) }
})
