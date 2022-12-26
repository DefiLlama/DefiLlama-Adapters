const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  bsc: {
    tdex: '0xc6d390d9cbc7bbb2253b99fb0c3b3911c944e1ce',
    owner: '0x4bc90496ea2682c6474b2b81ef6b573068e4b1f7',
  },
  heco: {
    tdex: '0x0b416e5da1f68dd780683b5daef858b0a081c364',
    owner: '0x09a28712208bf913b2e79eab446594c9fab2f37c',
  },
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { tdex, owner, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, {[chain]: block}) => {
      const { output: tokens } = await sdk.api.abi.call({
        target: tdex,
        abi: abi.getTokenAddressList,
        params: [0, 301],
        chain, block,
      })
      if (chain === 'heco')
        tokens.push('0xa71edc38d189767582c38a3145b5873052c3e47a')
      return sumTokens2({ tokens, owner, chain, block, })
    }
  }
})

const abi = {
  getTokenAddressList: {"inputs":[{"internalType":"uint256","name":"start","type":"uint256"},{"internalType":"uint256","name":"end","type":"uint256"}],"name":"getTokenAddressList","outputs":[{"internalType":"address[]","name":"list","type":"address[]"}],"stateMutability":"view","type":"function"},
}