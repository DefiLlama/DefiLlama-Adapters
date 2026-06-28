const { addCookiePoolTvl } = require('../helper/cookiechain')

async function tvl(api) {
  await addCookiePoolTvl(api, 'cookieswap')
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'Counts the value of all tokens held in CookieSwap liquidity pools on Cookie Chain. Tokens without their own market price are valued through their COOK pool, or through another already-priced token they are paired with when no COOK pool exists. Each token can only add value in proportion to the COOK backing it, so low-liquidity pools cannot overstate TVL.',
  cookiechain: { tvl },
}
