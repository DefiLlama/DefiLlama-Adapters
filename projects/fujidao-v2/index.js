const { getLogs } = require('../helper/cache/getLogs')

const config = {
  ethereum: [
    { borrowFactory: '0x24E72207a078558BF9018dcF97D7f580E79B9221', borrowStartBlock: 17690796 },
  ],
  xdai: [
    { borrowFactory: '0xBeaa4b2cE11cc2F8a059341DaD422814B66d1aD0', borrowStartBlock: 28448319 },
    { borrowFactory: '0xeAcb50131a46a7b8C750c03ba336f2632fDb0344', borrowStartBlock: 28911067 },
  ],
  arbitrum: [
    { borrowFactory: '0x2855666fbc5f526269b1f5dc73dfc8e11acb67f1', borrowStartBlock: 101069692 },
    { borrowFactory: '0x2bb069a248Ba1c62062143462AE7bDB5C4360E3d', borrowStartBlock: 110400709 },
  ],
  optimism: [
    { borrowFactory: '0xC377e6e13426739f14E411dD88Af8056e2DcabA4', borrowStartBlock: 105577184 },
    { borrowFactory: '0x1cbf7f06c04226488B4D5b2d5EA5C8B965130500', borrowStartBlock: 106780843 },
  ],
  polygon: [
    { borrowFactory: '0x157A03942e4F88c0357e4Afc1da46E9Cc12DB1D5', borrowStartBlock: 43896122 },
    { borrowFactory: '0x6Ed2428624da78cfE2daeC70BE171D1752cDEfF8', borrowStartBlock: 44986739 },
  ],
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => {
  const factories = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      let logs = [];
      for (let i = 0; i < factories.length; i++) {
        const { borrowFactory, borrowStartBlock } = factories[i];
        const interlogs = await getLogs({
          api,
          target: borrowFactory,
          topics: ['0x89d38637357ca536d5c3f7cfcf4738f465b8b6bf51af92d02cb9fa8eb093f368'],
          eventAbi: 'event DeployBorrowingVault (address indexed vault, address indexed asset, address indexed debtAsset, string name, string symbol, bytes32 salt)',
          onlyArgs: true,
          fromBlock: borrowStartBlock,
          extraKey: 'borrow-vault'
        })
        interlogs.forEach(log => {
          logs.push(log);
        })
      }
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
      return api.getBalances()
    },
    borrowed: async (_, _b, _cb, { api, }) => {
      let logs = [];
      for (let i = 0; i < factories.length; i++) {
        const { borrowFactory, borrowStartBlock } = factories[i];
        const interlogs = await getLogs({
          api,
          target: borrowFactory,
          topics: ['0x89d38637357ca536d5c3f7cfcf4738f465b8b6bf51af92d02cb9fa8eb093f368'],
          eventAbi: 'event DeployBorrowingVault (address indexed vault, address indexed asset, address indexed debtAsset, string name, string symbol, bytes32 salt)',
          onlyArgs: true,
          fromBlock: borrowStartBlock,
          extraKey: 'borrow-vault'
        })
        interlogs.forEach(log => {
          logs.push(log);
        })
      }
      const vaults = logs.map(log => log.vault)
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
      return api.getBalances()
    }
  }
})