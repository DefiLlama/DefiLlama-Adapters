const { getLogs2 } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  ethereum: {
    factories: [
      { factory: "0x10f2773F54CA36d456d6513806aA24f5169D6765", fromBlock: 21636725 },
      { factory: "0xc4B490154c91C140E5b246147Eb1d6973b7b035D", fromBlock: 21636725 },
    ],
    blacklistedTokens: [ADDRESSES.ethereum.FRAX,]
  },
}

Object.keys(config).forEach(chain => {
  const { factories, blacklistedTokens} = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const toa = []
      for (const { factory, fromBlock } of factories) {
        const res = await getLogs2({ factory, fromBlock, api, eventAbi: 'event  CustodianDeployed (address indexed custodianAddr, address indexed custodianTkn, uint256 mintCap, uint256 _mintFee, uint256 _redeemFee)' })
        res.forEach(i => toa.push([i.custodianTkn, i.custodianAddr]))
      }
      return api.sumTokens({ tokensAndOwners: toa, blacklistedTokens,})
    }
  }
})