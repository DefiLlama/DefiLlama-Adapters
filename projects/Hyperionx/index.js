const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");
const wUSDC = '0xD33Db7EC50A98164cC865dfaa64666906d79319C'

const USDX = '0xEE43369197F78CFDF0D8fc48D296964C50AC7B57'
module.exports = {

  zkfair: {
        tvl: sumTokensExport({
          owner: USDX,
          tokens: [ wUSDC ],
        }),
  },
  methodology: `wUSDC will be equivalently converted into USDX, becoming part of Hyperion Exchange's TVL.`,
}
