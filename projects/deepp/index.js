const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

const BET_LP_CONTRACT = '0x84a512E120294C2017a88a8f1af2219Ec250CBaa';

module.exports = {
  methodology: 'Lists the number of owned USDC tokens in the Deepp LP and BetLock contracts.',
  start: 1696118400,
  arbitrum: {
    tvl: sumTokensExport({ owners: [BET_LP_CONTRACT], tokens: [ADDRESSES.arbitrum.USDC_CIRCLE] }),
  }
}; // node test.js projects/deepp/index.js