const { getWhitelistedTokens } = require('../helper/streamingHelper')

const config = {
  kava: { contract: '0xd8FDE1F90895AB64E74efD376129Ae3e79F1B9f9'},
  polygon: { contract: '0x015E0622F4311eA67dEcB5b433EFd611EF7600c2'},
}

module.exports = {
  methodology: "TVL is based on the active balances of assets deposited at the stream and vesting vaults for token streaming and vesting.",
}

Object.keys(config).forEach(chain => {
  const { contract } = config[chain]
  module.exports[chain] = {
    tvl: tvl(false),
    vesting: tvl(true),
  }

  function tvl(isVesting) {
    return async (api) => {
      const tokens = await api.fetchList({  lengthAbi: 'uint256:totalActiveAssets', itemAbi: 'activeAssets', target: contract})
      return api.sumTokens({ owner: contract, tokens: await getWhitelistedTokens({ api, tokens, isVesting})})
    }
  }
})

