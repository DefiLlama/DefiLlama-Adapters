const { sumTokens } = require('../helper/chain/starknet')
const { cachedGraphQuery } = require('../helper/cache')
const factory = '0x04ba0de31008f4e3edd42b3c31db8f49490505885d684b78f5aa1572850b3a5a'

async function tvl() {
  const { api } = arguments[3]
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