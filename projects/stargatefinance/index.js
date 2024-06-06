const ADDRESSES = require('../helper/coreAssets.json')
const abi = require('./abi.json')
const { nullAddress, sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

const CONFIG = {
  ethereum: {
    router: '0x8731d54E9D02c286767d56ac03e8037C07e01e98',
    etherToken: '0x72E2F4830b9E45d52F80aC08CB2bEC0FeF72eD9c',
    stakingContract: '0xB0D502E938ed5f4df2E681fE6E419ff29631d62b',
    stg: '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6',
  },
  bsc: {
    router: '0x4a364f8c717cAAD9A442737Eb7b8A55cc6cf18D8',
    stakingContract: '0x3052A0F6ab15b4AE1df39962d5DdEFacA86DaB47',
    stg: '0xB0D502E938ed5f4df2E681fE6E419ff29631d62b',
  },
  polygon: {
    router: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd',
    stakingContract: '0x8731d54E9D02c286767d56ac03e8037C07e01e98',
    stg: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
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
    stakingContract: '0x224D8Fd7aB6AD4c6eb4611Ce56EF35Dec2277F03',
    stg: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
  },
  avax: {
    router: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd',
    stakingContract: '0x8731d54E9D02c286767d56ac03e8037C07e01e98',
    stg: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
  },
  metis: {
    router: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
  },
  mantle: {
    router: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
  },
  base: {
    router: '0x45f1A95A4D3f3836523F5c83673c797f4d4d263B',
    etherToken: '0x224d8fd7ab6ad4c6eb4611ce56ef35dec2277f03',
    stakingContract: '0x06Eb48763f117c7Be887296CDcdfad2E4092739C',
    stg: '0xE3B53AF74a4BF62Ae5511055290838050bf764Df',
  },
  linea: {
    router: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
    etherToken: '0x224d8fd7ab6ad4c6eb4611ce56ef35dec2277f03',
    stakingContract: '0x4a364f8c717cAAD9A442737Eb7b8A55cc6cf18D8',
    stg: '0x808d7c71ad2ba3FA531b068a2417C63106BC0949',
  },
  kava: {
    router: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
  },
}

module.exports = {
  goerli: {
    tvl: async (api) => {
      return {
        [ADDRESSES.ethereum.WETH]: await api.call({ abi: 'erc20:balanceOf', target: '0xdD69DB25F6D620A7baD3023c5d32761D353D3De9', params: ['0x88124ef4a9ec47e691f254f2e8e348fd1e341e9b'], }),
      }
    },
  },
}

Object.keys(CONFIG).forEach((chain) => {
  let { router, etherToken = '', stakingContract, stg } = CONFIG[chain]
  etherToken = etherToken ? etherToken.toLowerCase() : ''


  module.exports[chain] = {
    tvl: async (api) => {
      const factory = await api.call({ abi: abi.factory, target: router })
      const pools = await api.fetchList({ lengthAbi: abi.allPoolsLength, itemAbi: abi.allPools, target: factory, })
      const tokens = await api.multiCall({ abi: abi.token, calls: pools })
      const toa = []
      tokens.forEach((t, i) => {
        t = t.toLowerCase()
        if (t === etherToken) toa.push([nullAddress, t])
        else toa.push([t, pools[i]])
      })
      return sumTokens2({ api, tokensAndOwners: toa })
    },
  }

  if (stakingContract && stg)
    module.exports[chain].staking = staking(stakingContract, stg)
})
