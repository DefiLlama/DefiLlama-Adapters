// JustLend V2 isolated-market lending — vault-list API (TRON mainnet).
// Amounts are returned human-readable; index.js converts them to raw units via each market's
// decimals, then values them by their real on-chain token addresses.
// The endpoint must serve mainnet data; zenvora.ablesdxd.link is the mainnet vault-list endpoint.

module.exports = {
  CHAIN_CONFIG: {
    tron: {
      cacheKey: 'justlend-v2',
      apiUrl: 'https://zenvora.ablesdxd.link/index/vault/list',
    },
  },
}
