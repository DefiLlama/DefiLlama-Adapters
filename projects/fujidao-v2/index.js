const { getLogs } = require('../helper/cache/getLogs')

const config = {
  ethereum: [
    { borrowFactory: '0x24E72207a078558BF9018dcF97D7f580E79B9221', startBlock: 17690796 },
    { yieldFactory: '0xc349fd29AeD02ec862DfC03AF16e786798d8Aa1b', startBlock: 17812787 },
  ],
  xdai: [
    { borrowFactory: '0xeAcb50131a46a7b8C750c03ba336f2632fDb0344', startBlock: 28911067 },
    { yieldFactory: '0xf3AC23Fd2437394FDfD257Ac5931cA8fBc8B573C', startBlock: 29161909 },

  ],
  arbitrum: [
    { borrowFactory: '0x2855666fbc5f526269b1f5dc73dfc8e11acb67f1', startBlock: 101069692 },
    { borrowFactory: '0x2bb069a248Ba1c62062143462AE7bDB5C4360E3d', startBlock: 110400709 },
    { yieldFactory: '0x1cbf7f06c04226488B4D5b2d5EA5C8B965130500', startBlock: 115128235},
  ],
  optimism: [
    { borrowFactory: '0xC377e6e13426739f14E411dD88Af8056e2DcabA4', startBlock: 105577184 },
    { borrowFactory: '0x1cbf7f06c04226488B4D5b2d5EA5C8B965130500', startBlock: 106780843 },
    { yieldFactory: '0x0D766AC0F6cE0591b073CB61A808b83f38F71340', startBlock: 107435743 },
  ],
  polygon: [
    { borrowFactory: '0x157A03942e4F88c0357e4Afc1da46E9Cc12DB1D5', startBlock: 43896122 },
    { borrowFactory: '0x6Ed2428624da78cfE2daeC70BE171D1752cDEfF8', startBlock: 44986739 },
    { yieldFactory: '0x645650030cDea7e2BC91F170261Ac5cd8DF50fD3', startBlock: 45583153 },
  ],
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => {
  const factories = config[chain]
  const bfactories = factories.filter( factory => factory.hasOwnProperty('borrowFactory'))
  const yfactories = factories.filter( factory => factory.hasOwnProperty('yieldFactory'))

  module.exports[chain] = {
    tvl: async (api) => {
      let blogs = [];
      for (let i = 0; i < bfactories.length; i++) {
        const { borrowFactory, startBlock } = bfactories[i];
        const interlogs = await getLogs({
          api,
          target: borrowFactory,
          topics: ['0x89d38637357ca536d5c3f7cfcf4738f465b8b6bf51af92d02cb9fa8eb093f368'],
          eventAbi: 'event DeployBorrowingVault (address indexed vault, address indexed asset, address indexed debtAsset, string name, string symbol, bytes32 salt)',
          onlyArgs: true,
          fromBlock: startBlock,
          extraKey: 'borrow-vault'
        })
        interlogs.forEach(log => {
          blogs.push(log);
        })
      }

      let ylogs = [];
      for (let i = 0; i < yfactories.length; i++) {
        const { yieldFactory, startBlock } = yfactories[i];
        const interlogs = await getLogs({
          api,
          target: yieldFactory,
          topics: ['0x14ae025703048a936103023525911fe390af421a739fbf9971e78f41abafb32e'],
          eventAbi: 'event DeployYieldVault (address indexed vault, address indexed asset, string name, string symbol, bytes32 salt)',
          onlyArgs: true,
          fromBlock: startBlock,
          extraKey: 'yield-vault'
        })
        interlogs.forEach(log => {
          ylogs.push(log);
        })
      }

      const bvaults = blogs.map(log => log.vault)
      const yvaults = ylogs.map(log => log.vault)
      const vaults = bvaults.concat(yvaults)

      const bassets = blogs.map(log => log.asset)
      const yassets = ylogs.map(log => log.asset)
      const assets = bassets.concat(yassets)

      const debtAssets = blogs.map(log => log.debtAsset)

      const [bals, debtBals] = await Promise.all([
        api.multiCall({ abi: 'uint256:totalAssets', calls: vaults, permitFailure: true }),
        api.multiCall({ abi: 'uint256:totalDebt', calls: bvaults, permitFailure: true, })
      ])

      vaults.map((_, i) => {
        const asset = assets[i]
        const bal = bals[i]
        if (!bal) return
        api.add(asset, bal)
      })

      bvaults.map((_, i) => {
        const debtAsset = debtAssets[i]
        const debtBal = debtBals[i]
        if (!debtBal) return
        api.add(debtAsset, debtBal * -1)
      })
    },
    borrowed: async (api) => {
      let logs = [];
      for (let i = 0; i < bfactories.length; i++) {
        const { borrowFactory, startBlock } = bfactories[i];
        const interlogs = await getLogs({
          api,
          target: borrowFactory,
          topics: ['0x89d38637357ca536d5c3f7cfcf4738f465b8b6bf51af92d02cb9fa8eb093f368'],
          eventAbi: 'event DeployBorrowingVault (address indexed vault, address indexed asset, address indexed debtAsset, string name, string symbol, bytes32 salt)',
          onlyArgs: true,
          fromBlock: startBlock,
          extraKey: 'borrow-vault'
        })
        interlogs.forEach(log => {
          logs.push(log);
        })
      }
      const vaults = logs.map(log => log.vault)
      const debtAssets = logs.map(log => log.debtAsset)

      const [bals, debtBals] = await Promise.all([
        api.multiCall({ abi: 'uint256:totalAssets', calls: vaults, permitFailure: true }),
        api.multiCall({ abi: 'uint256:totalDebt', calls: vaults, permitFailure: true })
      ])

      vaults.forEach((_, i) => {
        const debtBal = debtBals[i]
        const debtAsset = debtAssets[i]
        if (!debtBal) return
        api.add(debtAsset, debtBal)
      })      
    }
  }
})