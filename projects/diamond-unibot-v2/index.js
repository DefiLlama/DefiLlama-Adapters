const { getLogs, getAddress } = require('../helper/cache/getLogs')
const { sumTokens2, unwrapUniswapV3NFTs } = require('../helper/unwrapLPs')

async function tvl(_, _b, _cb, { api, }) {
  const balances = {}
  const logs = await getLogs({
    api,
    target: '0x8a908ec03e2610fa8dcaec93bb010560780ec860',
    topics: ['0x647c6c21d1279361153a5cf7618a50b9573a9729986f26d91c8a7e6501750f6f'],
    fromBlock: 49135720,
  })

  const pools = logs.map(i => getAddress(i.topics[1]))
  const wantTokens = logs.map(i => getAddress(i.data))

  await unwrapUniswapV3NFTs({ ...api, balances, owners: pools})
  return sumTokens2({ balances, api, tokensAndOwners: wantTokens.map((i, idx) => [i, pools[idx]])})
}

module.exports = {
  arbitrum: {
    tvl
  }
}