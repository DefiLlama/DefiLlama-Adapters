const { get } = require('../helper/http')
const { transformDexBalances } = require("../helper/portedTokens");

async function tvl(api) {
  const allPools = [];
  const pairs = await get('https://dex-backend-mainnet.prd.service.aepps.com/pairs')
  for (const pair of pairs) {
    const [pairLiquidityInfo] = await get('https://dex-backend-mainnet.prd.service.aepps.com/history?pairAddress=' + pair.address + '&limit=100&order=desc&toBlockTime=' + api.timestamp * 1000);
    allPools.push({
      token0: pair.token0,
      token0Bal: pairLiquidityInfo?.reserve0 || 0,
      token1: pair.token1,
      token1Bal: pairLiquidityInfo?.reserve1 || 0,
    })
  }

  return transformDexBalances({ chain: 'aeternity', data: allPools, });
}


module.exports = {
  methodology: 'TVL is calculated based on tokens that are locked in the Superhero DEX pools.',
  aeternity: {
    tvl,
  },
};