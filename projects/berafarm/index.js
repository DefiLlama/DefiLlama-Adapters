// Berafarm: senior/junior tranche vaults. Each vault deposits its base token
// through a StrategyManager into external strategies (lending markets, LPs).
// Vaults are discovered from the TrancheVaultFactory, and every manager's NAV
// is read from the protocol's DataEmitterFixed view contract.

const config = {
  berachain: {
    factories: ['0xfD2A077Fa8E81A258f85e21365EeaC5e6e92f109'],
    dataEmitter: '0x63245b18f70487038c885558Df242B9B357EB50F',
  },
}

const abi = {
  getTrancheVaultInfo: 'function getTrancheVaultInfo(uint256) view returns ((uint256 index, address trancheVault, address strategyManager, address vaultManagerConfig, address feeModule, address accessController, address seniorToken, address juniorToken))',
  getTrancheTvl: 'function getTrancheTvl(address strategyManager) view returns (uint256)',
}

async function tvl(api) {
  const { factories, dataEmitter } = config[api.chain]
  const vaults = (await Promise.all(factories.map((target) => api.fetchList({
    target,
    lengthAbi: 'uint256:getTrancheVaultCount',
    itemAbi: abi.getTrancheVaultInfo,
  })))).flat()

  const managers = vaults.map((v) => v.strategyManager)
  const currencies = await api.multiCall({ abi: 'address:currency', calls: managers })
  // Strategy balances + idle currency at the manager + pending rewards, in the
  // manager's currency (native decimals).
  const navs = await api.multiCall({ abi: abi.getTrancheTvl, target: dataEmitter, calls: managers })
  api.add(currencies, navs)
}

module.exports = {
  methodology: 'TVL is the net asset value of every Berafarm tranche vault, read on-chain from the DataEmitterFixed contract (getTrancheTvl): the base token held in each vault\'s strategies, plus idle base token at the strategy manager, plus pending strategy rewards valued in the base token. Vaults are discovered from the TrancheVaultFactory. Vault deposits are deployed into other listed protocols (Bend, Dolomite, Kodiak), so TVL is marked as double counted.',
  doublecounted: true,
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})
