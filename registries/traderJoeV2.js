const { joeV2Export } = require('../projects/helper/traderJoeV2')
const { buildProtocolExports } = require('./utils')

function joeV2ExportFn(chainConfigs) {
  return joeV2Export(chainConfigs)
}

const configs = {
  'magicsea-lb-v2': {
    // shimmer_evm: '0xEE0616a2DEAa5331e2047Bc61E0b588195A49cEa', // excluded since tvl is already counted in swapline
    iotaevm: '0x8Cce20D17aB9C6F60574e678ca96711D907fD08c',
  },
  'asteria-finance': {
    scroll: { factory: '0x77C99431b679e21C42464f1714221eAE94C1e3ed' },
  },
  'swapline': {
    fantom: '0x640801a6983c109805E928dc7d9794080C21C88E',
    optimism: '0xd08C98F6409fCAe3E61f3157B4147B6595E60cf3',
    polygon_zkevm: '0x5A5c0C4832828FF878CE3ab4fEc44d21200b1496',
    arbitrum: '0xEE0616a2DEAa5331e2047Bc61E0b588195A49cEa',
    base: '0x5A5c0C4832828FF878CE3ab4fEc44d21200b1496',
    shimmer_evm: '0xEE0616a2DEAa5331e2047Bc61E0b588195A49cEa',
    hallmarks: [
      ['2023-04-24', "Launch on Optimism"],
      ['2023-07-11', "Launch on Arbitrum"],
      ['2023-08-01', "Launch on Base"],
      ['2023-12-18', "Launch on ShimmerEVM"],
    ],
  },
  'sectorone-dlmm': {
    ethereum: '0x9d8688043150c2B2A4cdCE2eD03eB40b6cCd2c57',
    base: {
      factories: ['0x3357f02fB3aA78fc86D3Bccdc5Edf039D4b952B5', { factory: '0x217da3e53F221D1f36e8b09bc7d55d4012C0aa70', isLb: true }],
    },
    megaeth: '0x304BaEB300dD71CD76f771343E74612C2237a320',
  },
  'E3': {
    fantom: '0x8597dB3ba8dE6BAAdEDa8cBa4dAC653E24a0e57B',
    arbitrum: '0x8597dB3ba8dE6BAAdEDa8cBa4dAC653E24a0e57B',
    base: '0x8597dB3ba8dE6BAAdEDa8cBa4dAC653E24a0e57B',
  },
  'bean-exchange': {
    monad: { factory: '0x8Bb9727Ca742C146563DccBAFb9308A234e1d242' },
  },
  'traderjoe-lb': {
    avax: { factory: '0x6e77932a92582f504ff6c4bdbcef7da6c198aeef', isLb: true },
    arbitrum: { factory: '0x1886d09c9ade0c5db822d85d21678db67b6c2982', isLb: true },
    bsc: { factory: '0x43646a8e839b2f2766392c1bf8f60f6e587b6960', isLb: true },
  },
  'merchant-moe-lb': {
    mantle: '0xa6630671775c4EA2743840F9A5016dCf2A104054',
  },
  'hyperbrick': {
    hyperliquid: '0x4A1EFb00B4Ad1751FC870C6125d917C3f1586600',
  },
  'traderjoe-lb-v2-2': {
    avax: '0xb43120c4745967fa9b93E79C149E66B0f2D6Fe0c',
    arbitrum: '0xb43120c4745967fa9b93E79C149E66B0f2D6Fe0c',
    monad: '0xb43120c4745967fa9b93E79C149E66B0f2D6Fe0c',
  },
  'traderjoe-lb-v2-1': {
    avax: '0x8e42f2F4101563bF679975178e880FD87d3eFd4e',
    arbitrum: {
      factory: '0x8e42f2F4101563bF679975178e880FD87d3eFd4e',
      blacklistedTokens: ['0xef261714f7e5ba6b86f4780eb6e3bf26b10729cf'],
      staking: ['0x43646A8e839B2f2766392C1BF8f60F6e587B6960', '0x371c7ec6D8039ff7933a2AA28EB827Ffe1F52f07'],
    },
    bsc: '0x8e42f2F4101563bF679975178e880FD87d3eFd4e',
    ethereum: '0xDC8d77b69155c7E68A95a4fb0f06a71FF90B943a',
  },
  'swapline-lb-v2': {
    base: '0x20918F4BA70439C58d070D4746f3aA303a7595d8',
  },
  'pharaoh-exchange-dlmm': {
    avax: '0xEb480050b016f6c6d45203D2346B68bDDDa23D4D',
  },
  'metropolis-exchange-dlmm': {
    sonic: '0x39D966c1BaFe7D3F1F53dA4845805E15f7D6EE43',
  },
}

module.exports = buildProtocolExports(configs, joeV2ExportFn)
