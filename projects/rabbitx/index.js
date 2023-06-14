const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: '0xFc7f884DE22a59c0009C91733196b012Aecb8F41', tokens: [ADDRESSES.ethereum.USDT]})
  }
}