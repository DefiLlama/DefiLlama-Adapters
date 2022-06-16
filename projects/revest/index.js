const { sumTokens2 } = require("../helper/unwrapLPs")
const { get } = require("../helper/http")
const sdk = require('@defillama/sdk')

const tokenAddress = 'https://defi-llama-feed.vercel.app/api/address'
const config = {
  ethereum: {
    holder: '0xA81bd16Aa6F6B25e66965A2f842e9C806c0AA11F',
    graph: 'https://api.thegraph.com/subgraphs/name/revest-finance/revest-mainnet-subgraph',
    chainId: 1,
  },
  polygon: {
    holder: '0x3cCc20d960e185E863885913596b54ea666b2fe7',
    chainId: 137,
  },
  fantom: {
    holder: '0x3923E7EdBcb3D0cE78087ac58273E732ffFb82cf',
    graph: 'https://api.thegraph.com/subgraphs/name/revest-finance/revestfantomtvl',
    chainId: 250,
  },
  avax: {
    holder: '0x955a88c27709a1EEf4ACa0df0712c67B48240919',
    chainId: 43114,
  },
}

const tokenTrackersABI = {
  "inputs": [
    {
      "internalType": "address",
      "name": "",
      "type": "address"
    }
  ],
  "name": "tokenTrackers",
  "outputs": [
    {
      "internalType": "uint256",
      "name": "lastBalance",
      "type": "uint256"
    },
    {
      "internalType": "uint256",
      "name": "lastMul",
      "type": "uint256"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}


module.exports = {
  methodology: "We list all tokens in our vault and sum them together",
};


Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => {
      const { chainId, graph, holder } = config[chain]
      const tokenURL = `${tokenAddress}?chainId=${chainId}`
      const { body: tokens } = await get(tokenURL)
      const balances = await sumTokens2({ chain, block, owner: holder, tokens })
      const { output: tokenRes } = await sdk.api.abi.multiCall({
        target: holder,
        abi: tokenTrackersABI,
        calls: tokens.map(i => ({ params: i})),
        chain, block,
      })
      const balance2 = {}
      tokenRes.forEach(i => balance2[i.input.params[0]] = i.output.lastBalance)
      console.log(chain, balances, balance2)
      return balances
    }
  }
})
