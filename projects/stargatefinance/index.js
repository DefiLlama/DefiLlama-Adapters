const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi.json")
const { nullAddress, sumTokens2, } = require('../helper/unwrapLPs')

const CONFIG = {
  ethereum: {
    router: '0x8731d54E9D02c286767d56ac03e8037C07e01e98',
    etherToken: '0x72E2F4830b9E45d52F80aC08CB2bEC0FeF72eD9c',
  },
  bsc: {
    router: '0x4a364f8c717cAAD9A442737Eb7b8A55cc6cf18D8',
  },
  polygon: {
    router: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd',
  },
  arbitrum: {
    router: '0x53Bf833A5d6c4ddA888F69c22C88C9f356a41614',
    etherToken: '0x82CbeCF39bEe528B5476FE6d1550af59a9dB6Fc0',
  },
  optimism: {
    router: '0xB0D502E938ed5f4df2E681fE6E419ff29631d62b',
    etherToken: '0xb69c8CBCD90A39D8D3d3ccf0a3E968511C3856A0',
  },
  fantom: {
    router: '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6',
  },
  avax:{
    router: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd',
  },
  metis:{
    router: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
  },
}

module.exports = {
  goerli:{
    tvl: async (_, _b, _cb, { api, })=>{
      return {
        [ADDRESSES.ethereum.WETH]: await api.call({ abi: 'erc20:balanceOf', target: "0xdD69DB25F6D620A7baD3023c5d32761D353D3De9", params:["0x88124ef4a9ec47e691f254f2e8e348fd1e341e9b"] }) 
      }
    }
  }
};

Object.keys(CONFIG).forEach(chain => {
  let { router, etherToken = '', } = CONFIG[chain]
  etherToken = etherToken.toLowerCase()
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const factory = await api.call({  abi: abi.factory, target: router }) 
      const pools = await api.fetchList({  lengthAbi: abi.allPoolsLength, itemAbi: abi.allPools, target: factory})
      const tokens = await api.multiCall({  abi: abi.token, calls: pools})
      const toa = []
      tokens.forEach((t, i) => {
        t = t.toLowerCase()
        if (t === etherToken) toa.push([nullAddress, t])
        else toa.push([t, pools[i]])
      })  
      return sumTokens2({ api, tokensAndOwners: toa })
    }
  }
})