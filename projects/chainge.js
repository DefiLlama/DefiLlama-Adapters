const { getUniTVL } = require('./helper/unknownTokens');
const utils = require('./helper/utils');

// fusion
async function fetch() {
  let tvl = await utils.fetchURL('https://info.chainge.finance/api/v1/info/getInfoOuterTvl')

  return tvl.data.data.totalTvl
}

module.exports = {
  methodology: "assets in liquidity are counted as TVL",
  fusion: {
    tvl: getUniTVL({ factory: '0xb260b0474B29642f8317530591B99b052Ce4788f', useDefaultCoreAssets: true, fetchBalances: true, })
  }
}
