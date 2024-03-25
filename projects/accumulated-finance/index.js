const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  "accumulate": [
    {
      "ethereum": {
        "baseToken": "0xdf4ef6ee483953fe3b84abd08c6a060445c01170",
        "LST": "0x7AC168c81F4F3820Fa3F22603ce5864D6aB3C547"
      }
    },
    {
      "arbitrum": {
        "baseToken": "0xdf4ef6ee483953fe3b84abd08c6a060445c01170",
        "LST": "0x7AC168c81F4F3820Fa3F22603ce5864D6aB3C547"
      },
    }
  ],
  "velas": [
    {
      "velas": {
        "LST": "0x3557371afed82dd683de278924bd0e1a790a3c49"
      }
    },
    {
      "bsc": {
        "baseToken": "0x8c543aed163909142695f2d2acd0d55791a9edb9",
        "LST": "0xcba2aeEc821b0B119857a9aB39E09b034249681A"
      },
    }
  ],
  "manta": [
    {
      "manta": {
        token: '0x95cef13441be50d20ca4558cc0a27b601ac544e5',
        "LST": "0xcba2aeec821b0b119857a9ab39e09b034249681a"
      }
    }
  ],
  "zeta": [
  {
    "zeta": {
      "baseToken": '0xf091867ec603a6628ed83d274e835539d82e9cc8',
      "LST": '0xcba2aeec821b0b119857a9ab39e09b034249681a'
    }
  },
  {
    "bsc": {
      "baseToken": "0xf091867ec603a6628ed83d274e835539d82e9cc8",
      "LST": "0xcf123d8638266629fb02fc415ad47bd47de01a6b"
    },
  },
  {
    "ethereum": {
      "baseToken": "0xf091867ec603a6628ed83d274e835539d82e9cc8",
      "LST": "0xf38feedb0c85c1e1d6864c7513ac646d28bb0cfc"
    }
  },
  ]
}

function transformConfig(config) {
  const result = {};
  Object.values(config).forEach(chainArray => {
    chainArray.forEach(chainConfig => {
      Object.entries(chainConfig).forEach(([chain, { baseToken, LST, token }]) => {
        if (!result[chain]) {
          result[chain] = [];
        }
        result[chain].push({
          ...(baseToken && { baseToken }),
          ...(token && { token }),
          LST
        });
      });
    });
  })
  return result;
}

module.exports = {
  methodology:
    "We aggregated liquid staking tokens issued by Accumulated Finance",
}

const transformedConfig = transformConfig(config);

Object.entries(transformedConfig).forEach(([chain, configs]) => {
  module.exports[chain] = {
    tvl: async (api) => {
      let totalSupply = 0;
      for (const { LST, baseToken, token } of configs) {
        const supply = await api.call({ abi: 'uint256:totalSupply', target: LST });
        totalSupply += parseInt(supply, 10);
        api.add(token ?? baseToken ?? ADDRESSES.null, supply, { skipChain: !!baseToken })
      }
      return api.getBalances();
    },
  }
})