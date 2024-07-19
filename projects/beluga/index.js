const { getLogs } = require('../helper/cache/getLogs')
const sdk = require('@defillama/sdk')

const config = {
  fantom: {
    factory: '0x83ae1aec3f9be3cf55db2f5d8acb09956dcdc233',
    fromBlock: 33212099,
    topic: '0x688da1863a5295d623a6e790e9bd1530833713e4656764558f6fda4ed9922900',
  },
  polygon: {
    factory: '0x0208086CC6d2e2792Ca66C5C85d4d8D04Ce7FeE4',
    fromBlock: 21961980,
    topic: '0x688da1863a5295d623a6e790e9bd1530833713e4656764558f6fda4ed9922900',
  }
}

module.exports = {};

Object.keys(config).forEach(chain => {
  const { factory, fromBlock, topic, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const balances = {}
      const data = await getLogs({
        api,
        target: factory,
        topics: [topic],
        fromBlock,
        eventAbi: 'event VaultDeployment(address vault, address strategy, string vaultType)',
      })

      const vaults = data.map(i => i.args.vault)
      const underlying = await api.multiCall({ abi: 'address:underlying', calls: vaults, })
      const bals = await api.multiCall({ abi: 'uint256:underlyingBalanceInVault', calls: vaults, })
      bals.forEach((a, i) => sdk.util.sumSingleBalance(balances, underlying[i], a, chain))
      return balances
    }
  }
})