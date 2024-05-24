const { nullAddress } = require("../helper/tokenMapping");
const { sumTokensExport } = require("../helper/unwrapLPs");

const BSC_POOL_CONTRACT = '0xB1FcDb8Ed3c2Bc572440b08a5A93984f366BBf3C';

module.exports = {
  methodology: 'counts the number of BNB tokens in the bsc pool contract.',
  bsc: {
    tvl: sumTokensExport({ owner: BSC_POOL_CONTRACT, tokens: [nullAddress], })
  }
}