const { get } = require('../helper/http');

async function tvl(api) {
  const { pools } = await get('https://amm-api.stellarx.com/api/pools/?cursor=1&format=json&limit=500&order=desc&orderField=liquidity');
  pools.forEach(({ liquidity }) => {
    api.addUSDValue(Math.round(liquidity))
  })
}

module.exports = {
  misrepresentedTokens: true,
  stellar: { tvl },
}
