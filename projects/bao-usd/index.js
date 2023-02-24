const { sumTokensExport, } = require("../helper/unwrapLPs");

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ tokens: ['0x6b175474e89094c44da98b954eedeac495271d0f'], owner: '0x720282bb7e721634c95f0933636de3171dc405de'}),
  }
};