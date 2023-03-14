const { getLogs, getAddress } = require('../helper/cache/getLogs')
const { sumTokens2, unwrapUniswapV3NFTs } = require('../helper/unwrapLPs')

const lendingPools = [
  ['0x82af49447d8a07e3bd95bd0d56f35241523fbab1', '0xedd1efa76fe59e9106067d824b89b59157c5223c'], // WETH
]

const vaults = [
  [
    [
      '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', // USDC
      '0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a', // GMX
    ],
    '0x8610D60f5329B0560c8F0CEb80175F342fe943F3' // vault
  ]
]

async function tvl(_, _b, _cb, { api, }) {
  const balances = await sumTokens2({ api, ownerTokens: vaults })
  const logs = await getLogs({
    api,
    target: '0x8a908ec03e2610fa8dcaec93bb010560780ec860',
    topics: ['0x647c6c21d1279361153a5cf7618a50b9573a9729986f26d91c8a7e6501750f6f'],
    fromBlock: 49135720,
  })

  const pools = logs.map(i => getAddress(i.topics[1]))
  const wantTokens = logs.map(i => getAddress(i.data))

  await unwrapUniswapV3NFTs({ ...api, balances, owners: pools })
  const tokensAndOwners = wantTokens.map((i, idx) => [i, pools[idx]])
  tokensAndOwners.push(...lendingPools)
  return sumTokens2({ balances, api, tokensAndOwners })
}

module.exports = {
  arbitrum: {
    tvl
  }
}