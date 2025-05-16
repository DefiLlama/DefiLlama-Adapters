
const { fetchURL } = require('../helper/utils');

const poolsEndpoint = "https://api.titan.tg/beta/clmm/pools" // clmm pools

async function tvl(api) {
  const response = await fetchURL(poolsEndpoint);
  const pools = response.data;
  pools.map((pool) => {
    api.add(pool.token0Address, pool.token0Balance);
    api.add(pool.token1Address, pool.token1Balance);
  });  
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: `TVL calculation methodology is the sum of all the pools' token balances`.trim(),
  ton: {
    tvl
  }
}