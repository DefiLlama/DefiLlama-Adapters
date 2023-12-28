const ADDRESSES = require('../helper/coreAssets.json')
const config = {
  "ethereum": {
    "baseToken": "0xdf4ef6ee483953fe3b84abd08c6a060445c01170",
    "LST": "0x7AC168c81F4F3820Fa3F22603ce5864D6aB3C547"
  },
  "arbitrum": {
    "baseToken": "0xdf4ef6ee483953fe3b84abd08c6a060445c01170",
    "LST": "0x7AC168c81F4F3820Fa3F22603ce5864D6aB3C547"
  },
  "velas": {
    "LST": "0x3557371afed82dd683de278924bd0e1a790a3c49"
  },
  "bsc": {
    "baseToken": "0x8c543aed163909142695f2d2acd0d55791a9edb9",
    "LST": "0xcba2aeEc821b0B119857a9aB39E09b034249681A"
  }
}

module.exports = {
  methodology:
    "We aggregated liquid staking tokens issued by Accumulated Finance",
}

Object.keys(config).forEach(chain => {
  const { LST, baseToken } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const supply = await api.call({ abi: 'uint256:totalSupply', target: LST })
      api.add(baseToken ?? ADDRESSES.null, supply, { skipChain: !!baseToken })
      return api.getBalances()
    },
  }
})