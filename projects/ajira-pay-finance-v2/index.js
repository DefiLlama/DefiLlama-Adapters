const { getWhitelistedTokens } = require('../helper/streamingHelper')

const config = {
  polygon: { contract: '0xe01f47646d1A30e829aeB4eDDa406A245E75C34B'},
  linea: { contract: '0xD2AA294B9A5097F4A09fd941eD0bE665bd85Eab2'},
  arbitrum: { contract: '0x8749DD80580EAEd2fE38e3729030a6b1519591f7'}
}

module.exports = {
  methodology: "TVL is based on the active balances of assets deposited at the V2 stream vaults for token streaming and vesting.",
}

Object.keys(config).forEach(chain => {
  const { contract } = config[chain]
  module.exports[chain] = {
    tvl: tvl(false),
    vesting: tvl(true),
  }

  function tvl(isVesting) {
    return async (_, _1, _2, { api }) => {
      const tokens = await api.fetchList({  lengthAbi: 'uint256:totalActiveAssets', itemAbi: 'function activeAssets(uint256) view returns (address)', target: contract})
      return api.sumTokens({ owner: contract, tokens: await getWhitelistedTokens({ api, tokens, isVesting})})
    }
  }
})