const { multiCall } = require('../helper/chain/starknet')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  polygon: [
    '0xe4880249745eAc5F1eD9d8F7DF844792D560e750'
  ],
  ethereum: [
    '0xe4880249745eAc5F1eD9d8F7DF844792D560e750'
  ],
  arbitrum: [
    '0x021289588cd81dC1AC87ea91e91607eEF68303F5'
  ],
  base: [
    '0xe4880249745eAc5F1eD9d8F7DF844792D560e750'
  ],
  starknet: [
    '0x20ff2f6021ada9edbceaf31b96f9f67b746662a6e6b2bc9d30c0d3e290a71f6'
  ],
  etlk: [
    '0xe4880249745eAc5F1eD9d8F7DF844792D560e750'
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
