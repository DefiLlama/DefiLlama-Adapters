const { getUniTVL } = require('../helper/getUniSubgraphTvl')

module.exports = {
  methodology: `AVAX, USDC, USDT, allocated in LP`,
  misrepresentedTokens: true,
  avax:{
    tvl: getChainTvl("https://dex.stealth.live/data"),
  }
}
