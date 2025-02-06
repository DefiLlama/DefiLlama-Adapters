const config = require("./config");
const { staking } = require('../helper/staking')
const { getLogs } = require('../helper/cache/getLogs')

async function getVaults(api) {
  const { factory, fromBlock } = config[api.chain]
  const logs = await getLogs({
    api,
    target: factory,
    eventAbi: 'event ContractCreated (address indexed creator, address created)',
    onlyArgs: true,
    fromBlock,
  })
  return logs.map(i => i.created)
}

async function tvl(api) {
  const vaults = await getVaults(api)
  const assets = await api.multiCall({ abi: 'address:asset', calls: vaults })
  const bals = await api.multiCall({ abi: 'uint256:collectiveCollateral', calls: vaults })
  api.addTokens(assets, bals)
  return api.getBalances()
}

async function borrowed(api) {
  const vaults = await getVaults(api)
  const assets = vaults.map(_ => config[api.chain].cash)
  const bals = await api.multiCall({ abi: 'uint256:collectiveDebt', calls: vaults })
  api.addTokens(assets, bals)
  return api.getBalances()
}

module.exports = {
  methodology:
    "Counts the TVL of the Phase vaults. Counts total borrows. Counts $CASH in the bond.",
};

Object.keys(config).forEach((chain) => {
  const { cash, bond } = config[chain];
  module.exports[chain] = {
    tvl,
    // borrowed,
    staking: staking(bond, cash),
  };
});
