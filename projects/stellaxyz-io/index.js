const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs, getAddress } = require('../helper/cache/getLogs');

const config = {
  arbitrum: {
    lendingContracts: [
      '0x3251f402cc06b33e742f08e1adbe0d2e4c1ea2fa',
      '0x36569fbc5a9d4c59d71e81d46db24256a09d1ad6',
      '0x5ecb93b3ef882bf42fee65541942d50a7dab4b33',
      '0x8e57143d14bae132210cfeec58d0c48875f7d415',
      '0xab416e57ec74e87295b8a1507745a954b0bb9f02',
    ],
    factory: '0x573a89fBc6b4a5B11a55DC9814A1018a3A9cD0CA',
    fromBlock: 101291920,
  }
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  const { lendingContracts, factory, fromBlock, } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: factory,
        topics: ['0x0803371633b57311f58d10924711080d2dae75ab17c5c0c262af3887cfca00bb'],
        fromBlock,
      })

      const strategies = logs.map(i => getAddress(i.data.slice(64, 64 * 2 + 2)))
      const positionManagers = await api.multiCall({  abi: 'address:positionManager', calls: strategies})

      const tokens = await api.multiCall({ abi: 'address:depositToken', calls: lendingContracts })
      await sumTokens2({ api, tokensAndOwners2: [tokens, lendingContracts] })
      return sumTokens2({ api, owners: positionManagers, resolveUniV3: true, })
    }
  }
})