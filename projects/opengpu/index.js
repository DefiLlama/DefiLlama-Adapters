const { staking } = require('../helper/staking');
const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");

const CONTRACTS = [
  '0x3C9634620A626b7e9a3fB74A8f800d67cdaF2A5B',
  '0x695a9c59cd823cbb2cd8331a835d1eb7982b170a'
];

const oGPU = '0x067Def80D66fB69C276e53b641f37ff7525162f6';

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ 
      owners: CONTRACTS, 
      token: coreAssets.null 
    }),
    staking: staking(CONTRACTS, oGPU),
  },
};