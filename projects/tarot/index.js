const { tarotHelper } = require('./tarotHelper')

const config = {
  fantom: {
    factories: [
      '0x35C052bBf8338b06351782A565aa9AaD173432eA', // Tarot Classic
      '0xF6D943c8904195d0f69Ba03D97c0BAF5bbdCd01B', // Tarot Requiem
      '0xbF76F858b42bb9B196A87E43235C2f0058CF7322', // Tarot Carcosa
      '0xa90092A6bfC100e32777B257AF46B3Ec2675d876', // Tarot Voyager
      '0xe034c865299dA16A429DaD26bFf5468C2689F7D8', // Tarot Forever
    ]
  },
  optimism: {
    factories: [
      '0x1D90fDAc4DD30c3ba38d53f52A884F6e75d0989e', // Tarot Opaline
      '0xD7cABeF2c1fD77a31c5ba97C724B82d3e25fC83C', // Tarot Velours
      '0x49DF1fe24cAf1a7dcBB2E2b1793b93b04eDb62bF', // Tarot Jupiter
      '0xBA47316035E6C95b31cb55BfB93458Ad41E4Da04', // Tarot Velouté
    ]
  },
  base: {
    factories: [
      '0xEb5809eb0f79aaB6e53E6374258b29A244Dfc12d', // Tarot Aerials
    ]
  },
  arbitrum: {
    factories: [
      '0x2217AEC3440E8FD6d49A118B1502e539f88Dba55', // Tarot Galahad
      '0x1bbD5637421a83b00C5Cd549B9C3721B28553F80', // Tarot Saurian
      '0x4B6daE049A35196A773028B2E835CCcCe9DD4723', // Tarot Ulysses
    ]
  },
  bsc: {
    factories: [
      '0x2217AEC3440E8FD6d49A118B1502e539f88Dba55', // Tarot Bermuda
      '0xC20099a3F0728634C1136489074508be7B406d3a', // Tarot Palermo
    ]
  },
  ethereum: {
    factories: [
      '0x1CAfcB9f3B5A152b1553bC2c688BA6a18054b653', // Tarot Eleusis
      '0x4B6daE049A35196A773028B2E835CCcCe9DD4723', // Tarot Equinox
    ]
  },
  kava: {
    factories: [
      '0x82B3413D575Aa93806308A04b53c78ae2037dA11', // Tarot Avignon
      '0x54950cae3d8513EA041066F31697903de5909F57', // Tarot Orleans
    ]
  },
  canto: {
    factories: [
      '0xb6193DF61351736e5190bF1DEB2E4f0769bd1BF2', // Tarot Cabaret
      '0x82B3413D575Aa93806308A04b53c78ae2037dA11', // Tarot Cantata
    ]
  },
  avax: {
    factories: [
      '0x36Df0A76a124d8b2205fA11766eC2eFF8Ce38A35', // Tarot Cascade
    ]
  },
  polygon: {
    factories: [
      '0x36Df0A76a124d8b2205fA11766eC2eFF8Ce38A35', // Tarot Paprika
    ]
  },
  era: {
    factories: [
      '0xf450b51fb2E1e4f05DAf9Cf7D9BB97714540B4f4', // Tarot Zeniths
    ]
  },
}

tarotHelper(module.exports, config)
