const { staking } = require('../helper/staking');
const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");

const contracts = [
  '0xd2fe354cfebaa06f2140f13b66d0b3e1fc3ceec0',
  '0x27cc372757ca955ebf93bd577cd95c4e12f5c14b',
];

const hashai = '0x292fcDD1B104DE5A00250fEBbA9bC6A5092A0076';

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ 
      owners: contracts, 
      token: coreAssets.null 
    }),
    staking: staking(contracts, hashai),
  },
};
