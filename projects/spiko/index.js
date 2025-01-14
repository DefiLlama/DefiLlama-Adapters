const { multiCall } = require('../helper/chain/starknet')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  polygon: [
    '0xe4880249745eAc5F1eD9d8F7DF844792D560e750',
    '0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80'
  ],
  ethereum: [
    '0xe4880249745eAc5F1eD9d8F7DF844792D560e750',
    '0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80'
  ],
  arbitrum: [
    '0x021289588cd81dC1AC87ea91e91607eEF68303F5',
    '0xcbeb19549054cc0a6257a77736fc78c367216ce7'
  ],
  starknet: [
    '0x20ff2f6021ada9edbceaf31b96f9f67b746662a6e6b2bc9d30c0d3e290a71f6',
    '0x4f5e0de717daa6aa8de63b1bf2e8d7823ec5b21a88461b1519d9dbc956fb7f2'
  ]
}

const totalSupplyAbi = {
  "name": "totalSupply",
  "type": "function",
  "inputs": [],
  "outputs": [
    {
      "name": "totalSupply",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
}

Object.keys(config).forEach(chain => {
  const assets = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      let supplies
      if (chain === 'starknet')
        supplies = await multiCall({ abi: totalSupplyAbi, calls: assets })
      else
        supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: assets })
      api.add(assets, supplies)
      return sumTokens2({ api })
    }
  }
})