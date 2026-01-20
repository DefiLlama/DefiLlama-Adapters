const { dexExport, getResources } = require('../helper/chain/aptos')
const sdk = require('@defillama/sdk');
const { transformDexBalances } = require('../helper/portedTokens');

module.exports = {
  misrepresentedTokens: true,
  aptos: {
    tvl: sdk.util.sumChainTvls([
      dexExport({
        account: '0x05a97986a9d031c4567e15b797be516910cfcb4156312482efc6a19c0a30c948',
        poolStr: 'liquidity_pool::LiquidityPool',
      }).aptos.tvl,
      dexExport({
        account: '0x61d2c22a6cb7831bee0f48363b0eec92369357aece0d1142062f7d5d85c7bef8',
        poolStr: 'liquidity_pool::LiquidityPool',
      }).aptos.tvl
    ])
  },
  move: {
    tvl: sdk.util.sumChainTvls([
      movePoolsV05Tvl,
      movePoolsV1Tvl
    ])
  }
}

async function movePoolsV05Tvl(api) {
  const account = '0x3851f155e7fc5ec98ce9dbcaf04b2cb0521c562463bd128f9d1331b38c497cf3'
  const poolStr = 'liquidity_pool::LiquidityPool'
  const token0Reserve = i => i.data.coin_x_reserve.value
  const token1Reserve = i => i.data.coin_y_reserve.value
  const chain = api.chain
  let pools = await getResources(account, chain)
  const resources = await getResources('0x4763c5cfde8517f48e930f7ece14806d75b98ce31b0b4eab99f49a067f5b5ef2', chain)
  pools = pools.filter(i => i.type.includes(poolStr))
  api.log(`Number of pools: ${pools.length}`)
  const data = []
  const tokenMap = {}
  resources.forEach(r => {
    if (!r.type.includes('wrapped')) return;
    let key = r.type.split('<')[1].replace('>', '')
    tokenMap[key] = r.data.metadata?.inner
  })
  const getTokens = i => i.type.split('<')[1].replace('>', '').split(', ').map(i => i.includes('wrapped') ? tokenMap[i] : i)

  pools.forEach(i => {
    const token0Bal = token0Reserve(i)
    const token1Bal = token1Reserve(i)
    const [token0, token1] = getTokens(i)
    data.push({
      token0,
      token1,
      token0Bal,
      token1Bal,
    })
  })

  return transformDexBalances({ api, data })
}

async function movePoolsV1Tvl(api) {
  const account = '0xeef5ce9727e7faf3b83cb0630e91d45612eac563f670eecaadf1cb22c3bdfdfb'
  const poolStr = 'pool::Pool'
  const token0Reserve = i => i.data.coins_x.value
  const token1Reserve = i => i.data.coins_y.value
  const chain = api.chain
  let pools = await getResources(account, chain)
  const resources = await getResources('0x4763c5cfde8517f48e930f7ece14806d75b98ce31b0b4eab99f49a067f5b5ef2', chain)
  pools = pools.filter(i => i.type.includes(poolStr))
  api.log(`Number of pools: ${pools.length}`)
  const data = []
  const tokenMap = {}
  resources.forEach(r => {
    if (!r.type.includes('wrapped')) return;
    let key = r.type.split('<')[1].replace('>', '')
    tokenMap[key] = r.data.metadata?.inner
  })
  const getTokens = i => i.type.split('<')[1].replace('>', '').split(', ').map(i => i.includes('wrapped') ? tokenMap[i] : i)

  pools.forEach(i => {
    const token0Bal = token0Reserve(i)
    const token1Bal = token1Reserve(i)
    const [token0, token1] = getTokens(i)
    data.push({
      token0,
      token1,
      token0Bal,
      token1Bal,
    })
  })

  return transformDexBalances({ api, data })
}