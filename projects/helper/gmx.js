const { sumTokens2 } = require('./unwrapLPs')

function gmxExports({ vault, blacklistedTokens = [] }) {
  return async (ts, _block, _, { api }) => {
    const tokenAddresses = await api.fetchList({
      target: vault,
      lengthAbi: abis.allWhitelistedTokensLength,
      itemAbi: abis.allWhitelistedTokens,
    })

    return sumTokens2({ api, owner: vault, tokens: tokenAddresses, blacklistedTokens, })
  }
}

const abis = {
  allWhitelistedTokensLength: 'uint256:allWhitelistedTokensLength',
  allWhitelistedTokens: 'function allWhitelistedTokens(uint256) view returns (address)'
}

module.exports = {
  gmxExports
}
