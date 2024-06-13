const ADDRESSES = require('../helper/coreAssets.json')
const { sumToken2, nullAddress, sumTokens2 } = require('../helper/unwrapLPs');
const { getConfig } = require('../helper/cache')
const defaultOwner = '0x25aB3Efd52e6470681CE037cD546Dc60726948D3'

const config = {
  merlin: {
    tokens: [
      ADDRESSES.bsc.iUSD,
      '0x480E158395cC5b41e5584347c495584cA2cAf78d',
      ADDRESSES.merlin.USDC,
      ADDRESSES.merlin.USDT,
      '0x9bd60d6FC99843207B8149f9190438C1F81BDdcD',
      '0xB5d8b1e73c79483d7750C5b8DF8db45A0d24e2cf',
      ADDRESSES.merlin.WBTC_1,
      '0xc21d5dEB02248bEa5aC3Ea51695bF2Cd36A4Ad2b',
      '0xd5534269e027bCb81d319e4213f665fab011038e',
    ],
  },
  bsquared: {
    tokens: [
      ADDRESSES.bsquared.USDT,
      ADDRESSES.bsquared.BSTONE,
      '0xa793740863F1710A87070a5918820976ff32B758',
      ADDRESSES.bsquared.FDUSD,
      ADDRESSES.bsquared.ETH,
      ADDRESSES.bsquared.USDC,
    ],
    id: 'b2',
  },
  zkfair: {
    tokens: [
      '0x4b21b980d0Dc7D3C0C6175b0A412694F3A1c7c6b',
    ],
  },
  xlayer: {
    tokens: [
      ADDRESSES.astarzk.USDT,
      ADDRESSES.xlayer.WETH,
      ADDRESSES.xlayer.USDC,
      ADDRESSES.astarzk.WBTC,
    ],
  },
  blast: {
    tokens: [
      ADDRESSES.blast.USDB,
      '0x58ef828c7b11dbed86291d328beb08f050738c37',
      '0x01593B8AaaDc5238F2f5C8597bC1402eB7a48c5f',
      ADDRESSES.bsc.iUSD,
    ],
  },
  tron: {
    owner: 'TKWqpzNucNNBMpfaE47F8CLhA8vzfNndH4',
    tokens: [
      'TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq',
      'TE2RzoSV3wFK99w6J9UnnZ4vLfXYoxvRwP',
      ADDRESSES.tron.BTT,
      'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7',
      ADDRESSES.tron.USDT,
      ADDRESSES.tron.JST,
      'TVj7RNVHy6thbM7BWdSe9G6gXwKhjhdNZS',
      ADDRESSES.tron.USDC,
      ADDRESSES.tron.USDD,
      ADDRESSES.tron.USDJ,
      ADDRESSES.tron.WTRX,
    ],
  },
  ancient8: { id: 'ancient8' },
  arbitrum: { id: 'arb' },
  aurora: {},
  avax: {},
  base: {},
  core: {},
  celo: {},
  cronos: {},
  inevm: {},
  kava: {},
  linea: {},
  manta: {},
  map: {},
  metis: {},
  mode: {},
  polygon: {},
  scroll: {},
  zeta: {},
  zklink: {},
  moonbeam: { id: 'beam'},
  bevm: { id: 'bevm2'},
  bsc: { id: 'bnb'},
  conflux: { id: 'cfx'},
  eos_evm: { id: 'eos'},
  ethereum: { id: 'eth'},
  fantom: { id: 'ftm'},
  xdai: { id: 'gnosis'},
  mantle: { id: 'mnt'},
  moonriver: { id: 'movr'},
  op_bnb: { id: 'opbnb'},
  optimism: { id: 'opt'},
  polygon_zkevm: { id: 'zkevm'},
  era: { id: 'zksync'},
  btr: { id: 'bitlayer'},
  bouncebit: { id: 'bb'}
}

async function addCoinfg(id, ownerTokens) {
  const { result } = await getConfig('meson', 'https://relayer.meson.fi/api/v1/list')
  const { address, tokens } = result.find(c => c.id === id) ?? {}
  if (!address) return;
  ownerTokens.push([tokens.map(i => i.addr ?? nullAddress).filter(i => i), address])
  return ownerTokens
}

Object.keys(config).forEach(chain => {
  const { id = chain, owner = defaultOwner, tokens, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const ownerTokens = []
      if (tokens) ownerTokens.push([tokens, owner])
      await addCoinfg(id, ownerTokens)
      return sumTokens2({ api, ownerTokens })
    }
  }
})