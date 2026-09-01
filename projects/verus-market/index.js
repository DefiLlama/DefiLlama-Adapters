const { get } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')


// verus bridge address? https://etherscan.io/address/0x71518580f36feceffe0721f06ba4703218cd7f63
async function tvl(api) {
  const { data: { results } } = await get("https://marketapi.verus.services/getdefichaininfo")

  const blacklist = new Set(results.map(i => i.lp_address))
  const processed = new Set()
  const data = []
  results.forEach(({ tokens, lp_address, }) => {
    if (processed.has(lp_address)) return;
    processed.add(lp_address)

    if (tokens.length < 2) return;

    const isXYPair = tokens.length === 2
    const noBlacklistedTokens = !tokens.some(i => blacklist.has(i.i_address))
    tokens = tokens.filter(i => !blacklist.has(i.i_address))

    if (isXYPair & noBlacklistedTokens) {
      data.push({
        token0: tokens[0].i_address,
        token1: tokens[1].i_address,
        token0Bal: tokens[0].reserves,
        token1Bal: tokens[1].reserves,
      })
    } else {
      tokens.forEach(i => api.add(i.i_address, i.reserves))
    }
  })

  return transformDexBalances({ data, api, })
}

module.exports = {
  verus: { tvl },
  timetravel: false,
  misrepresentedTokens: true,
}