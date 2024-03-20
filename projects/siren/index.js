const { getLogs, getAddress } = require('../helper/cache/getLogs');

const config = {
  arbitrum: { hedgePools: ["0x07835De4f96164758fE68283a5466E066c1885DC"] },
  polygon: { fromBlock: 17842705, factory: '0x0cdaa64b47474e02cdfbd811ec9fd2d265cd3a0a', vault: '0xc40a31bd9fed1569ce647bb7de7ff93facca36e9', },
  ethereum: { fromBlock: 11272343, factory: '0xb8623477ea6f39b63598ceac4559728dca81af63', vault: '0x7b63ecbc78402553a2d7f01ea3d10079c3aaa469', },
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, vault, hedgePools } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokensAndOwners = []
      if (hedgePools) {
        const tokens = await api.multiCall({ abi: 'address:collateralToken', calls: hedgePools })
        tokensAndOwners.push(...tokens.map((v, i) => [v, hedgePools[i]]))
      }

      if (factory) {
        const logs = await getLogs({
          api,
          target: factory,
          topics: ['0xa128ec36b78fa37f9f3e10bf2451c665a4e9fb1339f9f0e6fef45b343e73dcb1'],
          fromBlock,
        })
        const pools = logs.map(i => getAddress(i.data))
        const tokens = await api.multiCall({ abi: 'address:collateralToken', calls: pools })
        const toa = tokens.map((v, i) => [[v, pools[i]], [v, vault]]).flat()
        tokensAndOwners.push(...toa)
      }

      return api.sumTokens({ tokensAndOwners })
    }
  }
});
