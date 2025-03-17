const { dexExport, getResource } = require('../helper/chain/aptos')
const sdk = require('@defillama/sdk')

module.exports = {
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
      dexExport({
        account: '0x3851f155e7fc5ec98ce9dbcaf04b2cb0521c562463bd128f9d1331b38c497cf3',
        poolStr: 'liquidity_pool::LiquidityPool',
      }).aptos.tvl,
      dexExport({
        account: '0xeef5ce9727e7faf3b83cb0630e91d45612eac563f670eecaadf1cb22c3bdfdfb',
        poolStr: 'pool::Pool',
        token0Reserve: i => i.data.coins_x.value,
        token1Reserve: i => i.data.coins_y.value,
        getTokens: async (i) => {
          const chain = 'move';
          const account = '0x4763c5cfde8517f48e930f7ece14806d75b98ce31b0b4eab99f49a067f5b5ef2';
          const tokens = i.type.split('<')[1].replace('>', '').split(', ')
          const key = (token) => `0x4763c5cfde8517f48e930f7ece14806d75b98ce31b0b4eab99f49a067f5b5ef2::wrapper::WrapperCoinInfo<${token}>`
          const [token0, token1] = await Promise.all(
            [
              tokens[0].includes('wrapped') ? getResource(account, key(tokens[0]), chain).then(r => r.metadata.inner) : tokens[0],
              tokens[1].includes('wrapped') ? getResource(account, key(tokens[1]), chain).then(r => r.metadata.inner) : tokens[1]
            ]
          )
          return [token0, token1]
        },
      }).aptos.tvl
    ])
  }
}
