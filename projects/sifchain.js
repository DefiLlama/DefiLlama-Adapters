const { get } = require('./helper/http')

async function tvl() {
  // const getPoolsRes = await get('https://api.sifchain.finance/clp/getPools')
  const getPoolsRes = await get('https://sifchain-api.polkachu.com/clp/getPools')

  const total = getPoolsRes.result.pools
    .map(pool => +pool.native_asset_balance)
    .reduce((sum, current) => sum + current, 0)

    return {
      sifchain: total * 2 / 1e18
    }
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  sifchain: { tvl }
}
