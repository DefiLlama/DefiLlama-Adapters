const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  ethereum: {
    lspCreators: [
      "0x0b8de441B26E36f461b2748919ed71f50593A67b",
      "0x60F3f5DDE708D097B7F092EFaB2E085AC0a82F42",
      "0x31C893843685f1255A26502eaB5379A3518Aa5a9",
      "0x9504b4ab8cd743b06074757d3B1bE3a3aF9cea10",
      "0x439a990f83250FE2E5E6b8059F540af1dA1Ba04D",
    ],
    empCreators: [
      "0xad8fD1f418FB860A383c9D4647880af7f043Ef39",
      "0x9A077D4fCf7B26a0514Baa4cff0B481e9c35CE87",
      "0xddfC7E3B4531158acf4C7a5d2c3cB0eE81d018A5",
    ],
    fromBlock: 9937650,
  },
  polygon: {
    lspCreators: [
      "0x3e665D15425fAee14eEF53B9caaa0762b243911a",
      "0x62410e96a2ceB4d66824346e3264d1D9107a0aBE",
      "0x5Fd7FFF20Ee851cD7bEE72fB3C6d324e4C104c9f",
      "0x4FbA8542080Ffb82a12E3b596125B1B02d213424",
    ],
    fromBlock: 16241492,
  },
  boba: {
    lspCreators: [
      "0xC064b1FE8CE7138dA4C07BfCA1F8EEd922D41f68",
    ],
    fromBlock: 291475,
  },
}

Object.keys(config).forEach(chain => {
  const { lspCreators, empCreators = [], fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      let empPools = []
      let lspPools = []

      for (const factory of empCreators) {
        const logs = await getLogs2({ api, factory, eventAbi: 'event CreatedExpiringMultiParty (address indexed expiringMultiPartyAddress, address indexed deployerAddress)', fromBlock, })
        empPools = empPools.concat(logs.map(log => log.expiringMultiPartyAddress))
      }

      for (const factory of lspCreators) {
        const logs = await getLogs2({ api, factory, eventAbi: 'event CreatedLongShortPair (address indexed longShortPair, address indexed deployerAddress, address longToken, address shortToken)', fromBlock, })
        lspPools = lspPools.concat(logs.map(log => log.longShortPair))
      }

      const empTokens = await api.multiCall({ abi: 'address:collateralCurrency', calls: empPools })
      const lspTokens = await api.multiCall({ abi: 'address:collateralToken', calls: lspPools })

      await api.sumTokens({ tokensAndOwners2: [empTokens.concat(lspTokens), empPools.concat(lspPools)], })
    }
  }
})
