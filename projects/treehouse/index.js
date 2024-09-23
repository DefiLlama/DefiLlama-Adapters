const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  start: 1725926400, // Tuesday, September 10, 2024 12:00:00 AM
  ethereum: {
    tvl: sumTokensExport({ owner: '0x551d155760ae96050439AD24Ae98A96c765d761B', tokens: [ADDRESSES.ethereum.WSTETH], }),
  }
} 