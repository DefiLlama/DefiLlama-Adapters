const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  base: {
    // Strategy managers: every strategy they list is an ERC4626, use totalAssets
    strategyManagers: [
      '0xf7E745658fa6f1fe8f2CAb47861a273991Cd3374', // USDC SM
      '0x075193D36693DA7BA3Bb709cF63bEf070BA04D94', // USDT SM
    ],
    // Idle funds in strategy managers and OFTs
    idleFunds: [
      [ADDRESSES.base.USDC, '0xf7E745658fa6f1fe8f2CAb47861a273991Cd3374'],  // USDC SM
      [ADDRESSES.base.USDT, '0x075193D36693DA7BA3Bb709cF63bEf070BA04D94'],  // USDT SM
      [ADDRESSES.base.USDC, '0xd7aBC360dfcF1B6dD0a03138235e12A2bc1c1C8B'],  // USDC OFT
      [ADDRESSES.base.USDT, '0x264D6474802Ef8bc1bc05F89F7d640D1E93c5330'],  // USDT OFT
    ],
  },
  ethereum: {
    strategyManagers: [
      '0xf7E745658fa6f1fe8f2CAb47861a273991Cd3374', // USDC SM
      '0x075193D36693DA7BA3Bb709cF63bEf070BA04D94', // USDT SM
    ],
    idleFunds: [
      [ADDRESSES.ethereum.USDC, '0xf7E745658fa6f1fe8f2CAb47861a273991Cd3374'],  // USDC SM
      [ADDRESSES.ethereum.USDT, '0x075193D36693DA7BA3Bb709cF63bEf070BA04D94'],  // USDT SM
      [ADDRESSES.ethereum.USDC, '0xd58E8c1c83d598aD76B5f0E26B4a25cdB885d190'],  // USDC OFT Adapter
      [ADDRESSES.ethereum.USDT, '0x2D342De4c58a871b3525740C58a1C112D5835865'],  // USDT OFT Adapter
    ],
  },
}

Object.keys(config).forEach(chain => {
  const { strategyManagers, idleFunds } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      // Use ERC4626 totalAssets for every strategy listed by the strategy managers
      const strategies = await api.multiCall({ abi: 'address[]:getStrategies', calls: strategyManagers })
      await api.erc4626Sum({ calls: strategies.flat(), isOG4626: true })

      return sumTokens2({ api, tokensAndOwners: idleFunds })
    }
  }
})

module.exports.doublecounted = true
