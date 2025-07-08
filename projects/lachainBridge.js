const ADDRESSES = require('./helper/coreAssets.json')

const config = {
  polygon: {
    nativeBridge: ['0xE372D290F83c7487bdc925ddA187671bfF9e347b'], tokenBridge: ['0x82E4d5d7F36a22f2FEaaF87eCcDcDA7e0EFc98C3'], tokens: [ADDRESSES.polygon.USDT],
  },
  bsc: {
    nativeBridge: ['0xC926f267418d69147c88Edf88e93E78F2153f923'], tokenBridge: ['0x6571DD15430a455118EC6e24Dc7820489ED7019b'], tokens: [ADDRESSES.bsc.USDT],
  },
  ethereum: {
    nativeBridge: ['0xc7fc91a0a93d570738b2af6efb1595c3183809d7'], tokenBridge: ['0xAB49eb8Ca42f42fd7e8b745F2CC5BeDfb78d2D3E'], tokens: [ADDRESSES.ethereum.USDT],
  },
  avax: {
    nativeBridge: ['0xD4aE8F772dcf2e20b103c740AfD9D9f9E78dbfFC'], tokenBridge: ['0x8783256443217856B716464A068aabdecc3F0b95'], tokens: [ADDRESSES.avax.USDt],
  },
  fantom: {
    nativeBridge: ['0x012cebA65fD071473a9E0d3C5048702734a1eE5e'], tokenBridge: ['0x73Ec53a1Ee3Ea275D95212b41Dcce8cb9e0206Cd'], tokens: [ADDRESSES.fantom.fUSDT],
  },
  arbitrum: {
    nativeBridge: ['0xD4aE8F772dcf2e20b103c740AfD9D9f9E78dbfFC'], tokenBridge: ['0x43d92690D302C0e9f2fBD624eb9589F52b5AD115'], tokens: [ADDRESSES.arbitrum.USDT],
  },
  harmony: {
    nativeBridge: ['0x0A19afbE4519A40Df3b48BE46EDc0720724B4A6B'], tokenBridge: ['0x5DDDc78C8a59CeD4d25a8FD96BF9D9FdA561D0FF'], tokens: ['0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f'],
  },
  heco: {
    nativeBridge: ['0xbBF0b12A0Be425Db284905A3Cb0Ab72b178b6A4F'], tokenBridge: ['0x334d6D6c5EaE4bf5ec7De39a1547e6bDBdDcfbf3'], tokens: [ADDRESSES.heco.USDT],
  },
}

Object.keys(config).forEach(chain => {
  const { nativeBridge, tokenBridge, tokens} = config[chain]
  tokens.push(ADDRESSES.null)
  const owners = nativeBridge.concat(tokenBridge)
  module.exports[chain] = {
    tvl: async (api) => {
      return api.sumTokens({ owners, tokens })
    }
  }
})
