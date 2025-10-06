const { multiCall } = require('../helper/chain/starknet')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  polygon: [
    '0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80'
  ],
  ethereum: [
    '0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80'
  ],
  arbitrum: [
    '0xcbeb19549054cc0a6257a77736fc78c367216ce7'
  ],
  base: [
    '0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80'
  ],
  starknet: [
    '0x4f5e0de717daa6aa8de63b1bf2e8d7823ec5b21a88461b1519d9dbc956fb7f2'
  ],
  etlk: [
    '0xa0769f7A8fC65e47dE93797b4e21C073c117Fc80'
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
