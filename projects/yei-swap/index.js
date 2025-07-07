const { getConfig } = require('../helper/cache')
const { sumTokens2 } = require('../helper/unwrapLPs')

module.exports = {
  sei: {
    tvl,
  },
}

async function tvl(api) {
  const { pools, } = await getConfig('yei-swap', 'https://swap-api.yei.finance/pools')


  const ownerTokens = []
  for (const { token0, token1, address} of pools) {
    if (token0?.address && !token0.symbol.startsWith('stata')) ownerTokens.push([[token0.address], address])
    if (token1?.address && !token1.symbol.startsWith('stata')) ownerTokens.push([[token1.address], address])
  }

  return sumTokens2({ api, ownerTokens, permitFailure: true })

}
