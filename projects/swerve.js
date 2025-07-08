const { sumTokensExport } = require('./helper/unwrapLPs')
const ADDRESSES = require('./helper/coreAssets.json')

module.exports = {
  ethereum: {
    tvl: sumTokensExport({
      owner: '0x329239599afB305DA0A2eC69c58F8a6697F9F88d',
      tokens: [
        ADDRESSES.ethereum.TUSD,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.DAI,
      ]
    })
  }
}
