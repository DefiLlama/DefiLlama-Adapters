const config = {
  base: {
    cash: "0xbe92452bb46485AF3308e6d77786bFBE3557808d",
    bond: "0x443f102Ea65613d91365E1F5c37C21Ed2144023A",
    factory: '0xd3382599f6fe88bac72dfe23590644314146aa88',
    fromBlock: 4925577,
  },
};
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
