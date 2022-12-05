const { sumTokensExport } = require('../helper/unwrapLPs')

/** BEPRO Protocol is available on Moonbeam and Moonriver */
const config = {
    "ethereum": {
        token: "0xcf3c8be2e2c42331da80ef210e9b1b307c03d36a",
        bountyNetworks: []
    },
    "moonriver": {
        token: "0xCb4a593ce512D78162C58384f0b2Fd6e802c2c47",
        bountyNetworks: ["0x85dE589aDc4bC5F17075fcd603E8A0f7561d90C9"]
    },
    "moonbeam": {
        token: "0x4EdF8E0778967012D46968ceadb75436d0426f88",
        registry: "0x34DD5F63437FdC20557a8C6dDAeA056d3661c5e0",
        bountyNetworks: ["0xa9938c8712552Fe0b5312547fA96Ad9f14d58d3C"]
    }
}

module.exports = {
    methodology: 'counts the number of BEPRO tokens on Moonbeam Network contracts',
    start: 1000235,
};

Object.keys(config).forEach(chain => {
  const { token, registry, bountyNetworks  = []} = config[chain]
  const owners = [...bountyNetworks]
  if (registry) owners.push(registry)
  module.exports[chain] = {
    tvl: () => ({}),
    staking: sumTokensExport({ chain, owners, tokens: [token]})
  }
})
