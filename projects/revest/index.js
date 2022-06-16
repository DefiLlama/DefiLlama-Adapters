const { sumTokens2, unwrapLPsAuto, } = require("../helper/unwrapLPs")
const { get } = require("../helper/http")
const sdk = require('@defillama/sdk')
const { getChainTransform } = require('../helper/portedTokens')
const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')
const { getUniqueAddresses } = require('../helper/utils')

const tokenAddress = 'https://defi-llama-feed.vercel.app/api/address'
const config = {
  ethereum: {
    holder: '0xA81bd16Aa6F6B25e66965A2f842e9C806c0AA11F',
    graph: 'https://api.thegraph.com/subgraphs/name/revest-finance/revest-mainnet-subgraph',
    chainId: 1,
    revest: '0x120a3879da835a5af037bb2d1456bebd6b54d4ba',
    lp: '0x6490828bd87be38279a36f029f3b9af8b4e14b49',
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
  const { chainId, holder, revest, lp } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => {
      const blacklist = []
      if (revest) blacklist.push(revest.toLowerCase())
      if (lp) blacklist.push(lp.toLowerCase())
      const transform = await getChainTransform(chain)
      const tokenURL = `${tokenAddress}?chainId=${chainId}`
      let { body: tokens } = await get(tokenURL)
      tokens = getUniqueAddresses(tokens).filter(t => !blacklist.includes(t)) // filter out staking and LP tokens
      // const balances = await sumTokens2({ chain, block, owner: holder, tokens })
      const { output: tokenRes } = await sdk.api.abi.multiCall({
        target: holder,
        abi: tokenTrackersABI,
        calls: tokens.map(i => ({ params: i})),
        chain, block,
      })
      const balance2 = {}
      tokenRes.forEach(i => sdk.util.sumSingleBalance(balance2, transform(i.input.params[0]), i.output.lastBalance))
      await unwrapLPsAuto({ balances: balance2, block, chain, transformAddress: transform, })
      // console.log(chain, balances, balance2)
      return balance2
    },
    pool2: lp ? pool2(holder, lp, chain) : undefined,
    staking: revest ? staking(holder, revest, chain): undefined,
  }
})
