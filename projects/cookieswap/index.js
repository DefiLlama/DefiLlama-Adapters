const { addCookiePoolTvl } = require('../helper/cookiechain')

async function tvl(api) {
  await addCookiePoolTvl(api, 'cookieswap')
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'Counts the value of all tokens held in CookieSwap liquidity pools on Cookie Chain. Tokens that are not listed elsewhere are priced from their COOK liquidity pool.',
  cookiechain: { tvl },
}
