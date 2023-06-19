const { getLogs } = require('../helper/cache/getLogs')

const config = {
  xdai: { borrowFactory: '0xBeaa4b2cE11cc2F8a059341DaD422814B66d1aD0', borrowStartBlock: 28448319, },
  arbitrum: { borrowFactory: '0x2855666fbc5f526269b1f5dc73dfc8e11acb67f1', borrowStartBlock: 101069692, },
  optimism: { borrowFactory: '0xC377e6e13426739f14E411dD88Af8056e2DcabA4', borrowStartBlock: 105577184, },
  polygon: { borrowFactory: '0x157A03942e4F88c0357e4Afc1da46E9Cc12DB1D5', borrowStartBlock: 43896122, },
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => {
  const { borrowFactory, borrowStartBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: borrowFactory,
        topics: ['0x89d38637357ca536d5c3f7cfcf4738f465b8b6bf51af92d02cb9fa8eb093f368'],
        eventAbi: 'event DeployBorrowingVault (address indexed vault, address indexed asset, address indexed debtAsset, string name, string symbol, bytes32 salt)',
        onlyArgs: true,
        fromBlock: borrowStartBlock,
        extraKey: 'borrow-vault'
      })
      const vaults = logs.map(log => log.vault)
      const assets = logs.map(log => log.asset)
      const debtAssets = logs.map(log => log.debtAsset)
      const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults })
      const debtBals = await api.multiCall({ abi: 'uint256:totalDebt', calls: vaults, permitFailure: true, })
      bals.forEach((bal, i) => {
        if (!debtBals[i]) {
          if (+bal === 0) return;
          throw new Error(`No debt balance for ${vaults[i]}`)
        }
        api.add(assets[i], bal)
        api.add(debtAssets[i], debtBals[i] * -1)
      })
    },
    borrowed: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({
        api,
        target: borrowFactory,
        topics: ['0x89d38637357ca536d5c3f7cfcf4738f465b8b6bf51af92d02cb9fa8eb093f368'],
        eventAbi: 'event DeployBorrowingVault (address indexed vault, address indexed asset, address indexed debtAsset, string name, string symbol, bytes32 salt)',
        onlyArgs: true,
        fromBlock: borrowStartBlock,
        extraKey: 'borrow-vault'
      })
      const vaults = logs.map(log => log.vault)
      const assets = logs.map(log => log.asset)
      const debtAssets = logs.map(log => log.debtAsset)
      const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults })
      const debtBals = (await api.multiCall({ abi: 'uint256:totalDebt', calls: vaults, permitFailure: true, }))
      bals.forEach((bal, i) => {
        if (!debtBals[i]) {
          if (+bal === 0) return;
          throw new Error(`No debt balance for ${vaults[i]}`)
        }
        api.add(debtAssets[i], debtBals[i])
      })
    }
  }
})