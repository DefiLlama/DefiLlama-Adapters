const { sumTokens2 } = require('../helper/unwrapLPs')

const VAULT_ADDR = '0x8C7Ef34aa54210c76D6d5E475f43e0c11f876098';

function fulExports({ vault, }) {
  return async (ts, _block, _, { api }) => {
    const tokenAddresses = await api.fetchList({
      target: vault,
      lengthAbi: abis.whitelistedTokenCount,
      itemAbi: abis.whitelistedTokens,
    })

    return sumTokens2({ api, owner: vault, tokens: tokenAddresses, })
  }
}

const abis = {
  whitelistedTokenCount: 'uint256:whitelistedTokenCount',
  whitelistedTokens: 'function whitelistedTokens(uint256) view returns (address)'
}

module.exports = {
  cronos: {
    tvl: fulExports({ vault: VAULT_ADDR, }),
  }
}
