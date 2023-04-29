const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, sumTokensExport, } = require('../helper/unwrapLPs');

const config = {
  ethereum: [
    [[nullAddress], '0x882260324AD5A87bF5007904B4A8EF87023c856A'], // ETH
    [
      [
        ADDRESSES.ethereum.USDT, // USDT
        ADDRESSES.ethereum.USDC, // USDC
        ADDRESSES.ethereum.WBTC, // WBTC
      ],
      '0x0de7b091A21BD439bdB2DfbB63146D9cEa21Ea83'
    ]
  ],
  bsc: [
    [[nullAddress], '0xF1632012f6679Fcf464721433AFAAe9c11ad9e03'] // BNB
  ]
}
module.exports = {};

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: sumTokensExport({ ownerTokens: config[chain] }) }
})
