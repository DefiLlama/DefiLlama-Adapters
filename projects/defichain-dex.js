const { transformDexBalances } = require('./helper/portedTokens');
const { get } = require('./helper/http')

async function tvl() {
  const data = []
  const { data: info } = await get('https://ocean.defichain.com/v0/mainnet/poolpairs?size=200')
  info.forEach(i => data.push({ token0: i.tokenA.symbol, token0Bal: i.tokenA.reserve, token1: i.tokenB.symbol, token1Bal: i.tokenB.reserve,}))
  const balances = transformDexBalances({data, chain: 'defichain'})
  balances['defichain:dusd'] = balances['defichain:dusd'] * 0.7
  return balances
}

module.exports = {
  methodology: "Liquidity on the DEX, DUSD price is reduced by 30% because of the dex stability tax",
  timetravel: false,
  misrepresentedTokens: true,
  defichain: {
    tvl
  }
}
