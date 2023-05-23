const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: '0x4082C9647c098a6493fb499EaE63b5ce3259c574', tokens: [ADDRESSES.ethereum.USDC]})
  }
}