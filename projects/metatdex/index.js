const ADDRESSES = require('../helper/coreAssets.json')
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
  polygon: {
    tdex: '0xa63D57042B2d462B8dcf1570F8288dba405Cc909',
    owner: '0xd4013b79867C03d3FB5196899193efC8f29d54A4',
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
      if (chain === 'bsc') tokens.push(ADDRESSES.bsc.USDT)
      if (chain === 'heco') tokens.push(ADDRESSES.heco.USDT)
      if (chain === 'polygon') tokens.push(ADDRESSES.polygon.USDT)
      return sumTokens2({ tokens, owner, chain, block, })
    }
  }
})

const abi = {
  getTokenAddressList: "function getTokenAddressList(uint256 start, uint256 end) view returns (address[] list)",
}
