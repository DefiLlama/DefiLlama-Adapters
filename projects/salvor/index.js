const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

module.exports.avax = {
  start: '2023-05-07',
  hallmarks: [
    [1702501200, "Salvor Lending Launch"]
  ],
  methodology: 'TVL counts AVAX coins in the Salvor Pool address:0xab4fe2d136efd7f8dfce3259a5e3c5e4c0130c80',
  staking: staking("0x72b73fa1569dF9fF1aE9b29CD5b164Af6c02EbaA", "0xF99516BC189AF00FF8EfFD5A1f2295B67d70a90e"),
  tvl: sumTokensExport({ owners: ["0xab4fe2d136efd7f8dfce3259a5e3c5e4c0130c80"], tokens: [ADDRESSES.avax.WAVAX, nullAddress] }),
};
