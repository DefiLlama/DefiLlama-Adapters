const { transformDexBalances } = require('./helper/portedTokens');
const { get } = require('./helper/http')

async function tvl() {
  const data = []
  const { data: info } = await get('https://ocean.defichain.com/v0/mainnet/poolpairs?size=200')
  info.forEach(i => data.push({ token0: i.tokenA.symbol, token0Bal: i.tokenA.reserve, token1: i.tokenB.symbol, token1Bal: i.tokenB.reserve,}))
  return transformDexBalances({data, chain: 'defichain'})
}

module.exports = {
  methodology: "Liquidity on the DEX",
  timetravel: false,
  misrepresentedTokens: true,
  defichain: {
    tvl
  }
}
