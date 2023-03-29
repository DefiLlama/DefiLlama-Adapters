const sdk = require("@defillama/sdk");
const { sumTokens } = require('./helper/unwrapLPs')
const { getChainTransform } = require('./helper/portedTokens')

const config = {
  polygon: {
    nativeBridge: ['0xE372D290F83c7487bdc925ddA187671bfF9e347b'], tokenBridge: ['0x82E4d5d7F36a22f2FEaaF87eCcDcDA7e0EFc98C3'], tokens: ['0xc2132D05D31c914a87C6611C10748AEb04B58e8F'],
  },
  bsc: {
    nativeBridge: ['0xC926f267418d69147c88Edf88e93E78F2153f923'], tokenBridge: ['0x6571DD15430a455118EC6e24Dc7820489ED7019b'], tokens: ['0x55d398326f99059fF775485246999027B3197955'],
  },
  ethereum: {
    nativeBridge: ['0xc7fc91a0a93d570738b2af6efb1595c3183809d7'], tokenBridge: ['0xAB49eb8Ca42f42fd7e8b745F2CC5BeDfb78d2D3E'], tokens: ['0xdAC17F958D2ee523a2206206994597C13D831ec7'],
  },
  avax: {
    nativeBridge: ['0xD4aE8F772dcf2e20b103c740AfD9D9f9E78dbfFC'], tokenBridge: ['0x8783256443217856B716464A068aabdecc3F0b95'], tokens: ['0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7'],
  },
  fantom: {
    nativeBridge: ['0x012cebA65fD071473a9E0d3C5048702734a1eE5e'], tokenBridge: ['0x73Ec53a1Ee3Ea275D95212b41Dcce8cb9e0206Cd'], tokens: ['0x049d68029688eabf473097a2fc38ef61633a3c7a'],
  },
  arbitrum: {
    nativeBridge: ['0xD4aE8F772dcf2e20b103c740AfD9D9f9E78dbfFC'], tokenBridge: ['0x43d92690D302C0e9f2fBD624eb9589F52b5AD115'], tokens: ['0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'],
  },
  harmony: {
    nativeBridge: ['0x0A19afbE4519A40Df3b48BE46EDc0720724B4A6B'], tokenBridge: ['0x5DDDc78C8a59CeD4d25a8FD96BF9D9FdA561D0FF'], tokens: ['0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f'],
  },
  heco: {
    nativeBridge: ['0xbBF0b12A0Be425Db284905A3Cb0Ab72b178b6A4F'], tokenBridge: ['0x334d6D6c5EaE4bf5ec7De39a1547e6bDBdDcfbf3'], tokens: ['0xa71edc38d189767582c38a3145b5873052c3e47a'],
  },
}

module.exports = {};

const nullAddress = "0x0000000000000000000000000000000000000000"

Object.keys(config).forEach(chain => {
  const { nativeBridge, tokenBridge, tokens} = config[chain]
  module.exports[chain] = {
    tvl: async (_, _block, { [chain]: block}) => {
      const balances = {}
      const transform = await getChainTransform(chain)
      const {output: balance} = await sdk.api.eth.getBalance({ target: nativeBridge[0], block, chain })
      sdk.util.sumSingleBalance(balances, transform(nullAddress), balance)
      const toa = tokenBridge.map(o => tokens.map(t => [t,o])).flat()
      return sumTokens(balances, toa, block, chain, transform)
    }
  }
})
