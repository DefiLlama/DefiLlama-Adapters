const { nullAddress } = require("../helper/tokenMapping");
const { sumTokensExport } = require("../helper/unwrapLPs");

const BSC_POOL_CONTRACT = '0x6CcD65b5B7b1ADB3832EF88B9c3649c46e6a2037';
const BASE_POOL_CONTRACT = '0x190029c195c5b3e833663A56481217B90D9DD2B9';

module.exports = {
  methodology: 'counts the number of BNB and ETH tokens in the bsc, blast, base and mode pool contracts.',
  bsc: {
    tvl: sumTokensExport({ owner: BSC_POOL_CONTRACT, tokens: [nullAddress], })
  },
  base: {
    tvl: sumTokensExport({ owner: BASE_POOL_CONTRACT, tokens: [nullAddress], })
  },
};