const { getLogs2 } = require('../helper/cache/getLogs')

module.exports = {
  methodology: `TVL is supply balance minus borrows the euler contract.`,
}

const config = {
  ethereum: { factory: '0x29a56a1b8214D9Cf7c5561811750D5cBDb45CC8e', fromBlock: 20529225 }
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, } = config[chain]

  async function getVaults(api) {
    const logs = await getLogs2({
      api,
      factory,
      eventAbi: 'event ProxyCreated(address indexed proxy, bool upgradeable, address implementation, bytes trailingData)',
      fromBlock,
    })

    const vaults = logs.map(log => log.proxy)
    const tokens = await api.multiCall({  abi: 'address:asset', calls: vaults })

    return { vaults, tokens }
  }

  module.exports[chain] = {
    tvl: async (api) => {
      const { vaults, tokens } = await getVaults(api)
      return api.sumTokens({ tokensAndOwners2: [tokens, vaults] })
    },
    borrowed: async (api) => {
      const { vaults, tokens } = await getVaults(api)
      const borrows = await api.multiCall({  abi: 'uint256:totalBorrows', calls: vaults})
      api.add(tokens, borrows)
    },
  }
})
