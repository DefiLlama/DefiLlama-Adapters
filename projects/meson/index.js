const { sumToken2, nullAddress, sumTokens2 } = require('../helper/unwrapLPs');
const { getConfig } = require('../helper/cache')
const defaultOwner = '0x25aB3Efd52e6470681CE037cD546Dc60726948D3'

const config = {
  merlin: {
    tokens: [
      '0x0A3BB08b3a15A19b4De82F8AcFc862606FB69A2D',
      '0x480E158395cC5b41e5584347c495584cA2cAf78d',
      '0x6b4eCAdA640F1B30dBdB68f77821A03A5f282EbE',
      '0x967aEC3276b63c5E2262da9641DB9dbeBB07dC0d',
      '0x9bd60d6FC99843207B8149f9190438C1F81BDdcD',
      '0xB5d8b1e73c79483d7750C5b8DF8db45A0d24e2cf',
      '0xB880fd278198bd590252621d4CD071b1842E9Bcd',
      '0xc21d5dEB02248bEa5aC3Ea51695bF2Cd36A4Ad2b',
      '0xd5534269e027bCb81d319e4213f665fab011038e',
    ],
  },
  bsquared: {
    tokens: [
      '0x681202351a488040Fa4FdCc24188AfB582c9DD62',
      '0x7537C1F80c9E157ED7AFD93a494be3e1f04f1462',
      '0xa793740863F1710A87070a5918820976ff32B758',
      '0xC2Fe4f673455Ef92299770a09CDB5E8756A525D5',
      '0xD48d3A551757ac47655fCe25BDE1B0B6b1Cb2a5A',
      '0xE544e8a38aDD9B1ABF21922090445Ba93f74B9E5',
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
      '0x1e4a5963abfd975d8c9021ce480b42188849d41d',
      '0x5a77f1443d16ee5761d310e38b62f77f726bc71c',
      '0x74b7f16337b8972027f6196a17a631ac6de26d22',
      '0xea034fb02eb1808c2cc3adbc15f447b93cbe08e1',
    ],
  },
  blast: {
    tokens: [
      '0x4300000000000000000000000000000000000003',
      '0x58ef828c7b11dbed86291d328beb08f050738c37',
      '0x01593B8AaaDc5238F2f5C8597bC1402eB7a48c5f',
      '0x0a3bb08b3a15a19b4de82f8acfc862606fb69a2d',
    ],
  },
  tron: {
    owner: 'TKWqpzNucNNBMpfaE47F8CLhA8vzfNndH4',
    tokens: [
      'TFczxzPhnThNSqr5by8tvxsdCFRRz6cPNq',
      'TE2RzoSV3wFK99w6J9UnnZ4vLfXYoxvRwP',
      'TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4',
      'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7',
      'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      'TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9',
      'TVj7RNVHy6thbM7BWdSe9G6gXwKhjhdNZS',
      'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8',
      'TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn',
      'TMwFHYXLJaRUPeW6421aqXL4ZEzPRFGkGT',
      'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR',
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