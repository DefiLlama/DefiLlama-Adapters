const { sumTokens } = require('../helper/chain/starknet')
const { cachedGraphQuery } = require('../helper/cache')

async function tvl(api) {
  const query = '{  pools (first: 1000) {    poolAddress    token0 {      tokenAddress    }    token1 {      tokenAddress    }  }}'
  const { pools } = await cachedGraphQuery('starknet-jediswap-v2', 'https://api.v2.jediswap.xyz/graphql', query)
  const t = str => str.replace('0x', '0x0')
  const ownerTokens = pools.map(pool => [[t(pool.token0.tokenAddress), t(pool.token1.tokenAddress)], t(pool.poolAddress)])
  return sumTokens({ ownerTokens, api })
  // await getLogs({ fromBlock: 535428, topic: '0x27dd458d081c22bd6e76f4dddbc87f11e477b7c5823b13f147d45f91ec098ee', target: factory }).catch(console.error)
}

module.exports = {
  timetravel: false,
  starknet: {
    tvl,
  }
}