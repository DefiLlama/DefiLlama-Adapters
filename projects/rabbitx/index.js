const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owners: ['0xFc7f884DE22a59c0009C91733196b012Aecb8F41', '0x3b8F6D6970a24A58b52374C539297ae02A3c4Ae4'], tokens: [ADDRESSES.ethereum.USDT]})
  }
}
