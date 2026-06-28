const { addCookiePoolTvl } = require('../helper/cookiechain')

async function tvl(api) {
  await addCookiePoolTvl(api, 'cookiebox')
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'Counts the value of all tokens held in CookieBox liquidity pools on Cookie Chain. For token launches (bonding curves), only the COOK raised is counted, not the unsold token supply. Tokens that are not listed elsewhere are priced from their COOK liquidity pool.',
  cookiechain: { tvl },
}
