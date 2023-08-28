const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ tokens: [ADDRESSES.ethereum.DAI], owner: '0x720282bb7e721634c95f0933636de3171dc405de'}),
  }
};