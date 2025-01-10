const { staking } = require('../helper/staking');
const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");

const contracts = [
  "0x19cd3998f106ecc40ee7668c19c47e18b491e8a6",
  "0xf8515cae6915838543bcd7756f39268ce8f853fd",
];

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ 
      owners: contracts, 
      token: coreAssets.null 
    }),
    staking: staking(
      contracts,
      '0x9DFAD1b7102D46b1b197b90095B5c4E9f5845BBA'
    ),
    pool2: staking(
      contracts, 
      '0x9FF68F61cA5EB0c6606dC517a9d44001e564bb66'
    ),
  }
};
