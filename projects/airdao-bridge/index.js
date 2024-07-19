const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')

const CHAINS = {
  ethereum: {
    locker: "0x0De2669e8A7A6F6CC0cBD3Cf2D1EEaD89e243208",
    tokens: [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.WETH]
  },
  bsc: {
    locker: "0x92fa52d3043725D00Eab422440C4e9ef3ba180d3",
    tokens: [ADDRESSES.bsc.USDC, ADDRESSES.bsc.USDT, ADDRESSES.bsc.WBNB, ADDRESSES.bsc.BUSD]
  },
}

module.exports = {
  methodology:
    "Adds up the total value locked as collateral on the Bridge platform"
}

Object.keys(CHAINS).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport({ owner: CHAINS[chain].locker, tokens: CHAINS[chain].tokens })
  }
})
