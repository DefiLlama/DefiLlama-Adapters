// Base Vault: https://basescan.org/address/0xEAC80C1722E8990AAFeB2Ea3bcF040D29f722bd9
const VAULT = '0xEAC80C1722E8990AAFeB2Ea3bcF040D29f722bd9'
const VAULT_CREATION_BLOCK = 45249956

async function tvl(api) {
  if (api.block && api.block < VAULT_CREATION_BLOCK) return

  const tokenList = await api.fetchList({
    target: VAULT,
    lengthAbi: 'uint256:allWhitelistedTokensLength',
    itemAbi: 'function allWhitelistedTokens(uint256) view returns (address)',
  })
  const tokens = [...new Set(tokenList.map(token => token.toLowerCase()))]
  const listed = await api.multiCall({
    target: VAULT,
    abi: 'function whitelistedTokens(address) view returns (bool)',
    calls: tokens,
  })
  const listedTokens = tokens.filter((_, i) => listed[i])
  const poolAmounts = await api.multiCall({
    target: VAULT,
    abi: 'function poolAmounts(address) view returns (uint256)',
    calls: listedTokens,
  })
  api.addTokens(listedTokens, poolAmounts)
}

module.exports = {
  start: '2026-04-27',
  methodology: 'TVL measures the shared ZLP liquidity pool on Base across crypto and US stock markets. It values the Vault poolAmounts of each currently listed token once. Separately accounted trader collateral, fee reserves, and unallocated balances held by the Vault are excluded. ZLP and staked ZLP represent the same underlying liquidity.',
  base: { tvl },
}
