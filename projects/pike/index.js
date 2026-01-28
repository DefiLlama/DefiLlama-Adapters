const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unwrapLPs');
const { mergeExports } = require('../helper/utils');

const config = {
  ethereum: {
    tokensAndOwners: [
      [ADDRESSES.null, '0xFC7599cfFea9De127a9f9C748CCb451a34d2F063'],
      [ADDRESSES.ethereum.USDC, '0x54FD7bA87DDBDb4b8a28AeE34aB8ffC4004687De']
    ]
  },
  optimism: {
    tokensAndOwners: [
      [ADDRESSES.optimism.OP, '0x1E65e48532f6Cf9747774777F3f1F6dC6cf0D81b'],
      [ADDRESSES.optimism.USDC_CIRCLE, '0x7856493B59cdb1685757A6DcCe12425F6a6666a0']
    ]
  },
  arbitrum: {
    tokensAndOwners: [
      [ADDRESSES.arbitrum.ARB, '0x1E65e48532f6Cf9747774777F3f1F6dC6cf0D81b'],
      [ADDRESSES.arbitrum.USDC_CIRCLE, '0x7856493B59cdb1685757A6DcCe12425F6a6666a0']
    ]
  },
  base: {
    tokensAndOwners: [
      // [ADDRESSES.base.WETH, '0xFC7599cfFea9De127a9f9C748CCb451a34d2F063'],
      [ADDRESSES.base.USDC, '0xA9452cA8281556DAfA4C0d3DA3dcaAa184941032']
    ]
  }
}

const v1Module = {}

Object.keys(config).forEach(chain => {
  v1Module[chain] = {
    tvl: sumTokensExport(config[chain])
  }
})

const configV2 = {
  base: {
    pweETH: '0xAeBCc0Ed30A8478D1A0d4b9773edB30f0211f713',
    pwstETH: '0x8a7944fD5a61698762D7daa0898b5EafCf4936Dc',
    pwETH: '0xa1Aba5518ffC0aA26F3812aC4777081CceFfAFe6',
    pwSPA: '0x6996145AdDddb2ef51119D71f29C61513d30e8B3',
  }
}

const v2Module = {}

Object.keys(configV2).forEach(chain => {
  const pTokens = Object.values(configV2[chain])

  v2Module[chain] = {
    tvl: async (api) => {
      const tokens = await api.multiCall({ abi: 'address:asset', calls: pTokens })
      return api.sumTokens({ tokensAndOwners2: [tokens, pTokens] })
    },
    borrowed: async (api) => {
      const tokens = await api.multiCall({ abi: 'address:asset', calls: pTokens })
      const borrows = await api.multiCall({ abi: 'uint256:totalBorrows', calls: pTokens })
      api.add(tokens, borrows)
      return api.getBalances()
    }
  }
})

module.exports = mergeExports([v1Module, v2Module])