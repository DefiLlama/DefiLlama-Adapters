const { covalentGetTokens } = require('../helper/token')
const { getWhitelistedTokens } = require('../helper/streamingHelper')

const config = {
  linea: { owners: ['0xD2AA294B9A5097F4A09fd941eD0bE665bd85Eab2'], },
}

module.exports = {
  methodology: "TVL is based on the active balances of assets deposited at the V2 stream vaults for token streaming and vesting.",
}

Object.keys(config).forEach(chain => {
  const { owners } = config[chain]
  module.exports[chain] = {
    tvl: tvl(false),
    vesting: tvl(true),
  }

  function tvl(isVesting) {
    return async (api) => {
      const tokens = (await Promise.all(owners.map(i => covalentGetTokens(i, api, { onlyWhitelisted: false, })))).flat()
      return api.sumTokens({ owners, tokens: await getWhitelistedTokens({ api, tokens, isVesting})})
    }
  }
})