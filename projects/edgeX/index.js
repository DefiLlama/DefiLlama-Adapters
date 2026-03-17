const ADDRESSES = require('../helper/coreAssets.json');

const CONFIG = {
  ethereum: {
    owners: ['0xc0a1a1e4af873e9a37a0cac37f3ab81152432cc5', '0xfAaE2946e846133af314d1Df13684c89fA7d83DD', '0x7F861a7db997B4f6E5Ef9954A3b5D5b29c463Cb2'],
    tokens: [ADDRESSES.ethereum.USDT, '0x23878914efe38d27c4d67ab83ed1b93a74d4086a', ADDRESSES.ethereum.USDC, ADDRESSES.null]
  },
  arbitrum: {
    owners: ['0xceeed84620e5eb9ab1d6dfc316867d2cda332e41', '0x6F4836aFD5e21EDcee9b838C5a4125829EC198d0', '0x107695630130919cb040B095b9b20511D6e211bB', '0x81144d6E7084928830f9694a201E8c1ce6eD0cb2'],
    tokens: [ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.null]
  },
  bsc: {
    owners: ['0x3EedB0d9C95263778a62081F2A62FC77a392116d'],
    tokens: [ADDRESSES.bsc.USDT]
  },
}

const tvl = async (api) => {
  const { owners, tokens } = CONFIG[api.chain]
  return api.sumTokens({ owners, tokens })
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})

const EDGEX_USDC = '0x98d2919b9A214E6Fa5384AC81E6864bA686Ad74c'

module.exports.edgex = {
  tvl: async (api) => {
    const supply = await api.call({ target: EDGEX_USDC, abi: 'erc20:totalSupply' })
    api.add(ADDRESSES.ethereum.USDC, supply, { skipChain: true })
  }
}