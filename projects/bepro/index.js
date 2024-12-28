const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

/** BEPRO Protocol is available on Moonbeam and Moonriver */
const config = {
    "ethereum": {
        token: "0xcf3c8be2e2c42331da80ef210e9b1b307c03d36a",
        bountyNetworks: []
    },
    "moonriver": {
        token: ADDRESSES.moonriver.BEPRO,
        bountyNetworks: ["0x85dE589aDc4bC5F17075fcd603E8A0f7561d90C9"]
    },
    "moonbeam": {
        token: ADDRESSES.moonbeam.BEPRO,
        registry: "0x34DD5F63437FdC20557a8C6dDAeA056d3661c5e0",
        bountyNetworks: ["0xa9938c8712552Fe0b5312547fA96Ad9f14d58d3C"]
    }
}

module.exports = {
    methodology: 'counts the number of BEPRO tokens on Moonbeam Network contracts',
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
