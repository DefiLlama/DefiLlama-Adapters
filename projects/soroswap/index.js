const { callSoroban } = require('../helper/chain/stellar')

// Soroswap AMM (uni-v2 style) on Soroban. Pools are enumerated on-chain from
// the SoroswapFactory (all_pairs_length + all_pairs), then each pair's
// token_0/token_1/get_reserves are read directly:
// https://github.com/soroswap/core (public/mainnet.contracts.json)
const FACTORY = 'CA4HEQTL2WPEUYKYKCDOHCDNIV4QHNJ7EL4J4NQ6VADP7SYHVRYZ7AW2'

async function tvl(api) {
  const pairCount = await callSoroban(FACTORY, 'all_pairs_length')

  const pairs = []
  for (let i = 0; i < pairCount; i++)
    pairs.push(await callSoroban(FACTORY, 'all_pairs', [i]))

  for (const pair of pairs) {
    const [token0, token1, reserves] = await Promise.all([
      callSoroban(pair, 'token_0'),
      callSoroban(pair, 'token_1'),
      callSoroban(pair, 'get_reserves'),
    ])
    api.add(token0, reserves[0].toString())
    api.add(token1, reserves[1].toString())
  }
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  methodology:
    'Counts liquidity locked in all Soroswap pools, read on-chain: pools are enumerated from the SoroswapFactory contract and each pair\'s reserves are fetched via get_reserves.',
  stellar: { tvl },
}
