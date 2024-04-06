const { sumTokens2 } = require('../helper/unwrapLPs')

const CRO_VAULT_ADDR = '0x8C7Ef34aa54210c76D6d5E475f43e0c11f876098';
const ZKSYNC_VAULT_ADDR = '0x7d5b0215EF203D0660BC37d5D09d964fd6b55a1E';

function fulExports({ vault, }) {
  return async (api) => {
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
    tvl: fulExports({ vault: CRO_VAULT_ADDR, }),
  },
  era: {
    tvl: fulExports({ vault: ZKSYNC_VAULT_ADDR, }),
  },
}
