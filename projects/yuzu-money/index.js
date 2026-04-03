const CONFIG = {
  plasma: [
    '0x6695c0f8706C5ACe3Bdf8995073179cCA47926dc', // yzUsd
    // '0xC8A8DF9B210243c55D31c73090F06787aD0A1Bf6', // syzUsd
    '0xEbFC8C2Fe73C431Ef2A371AeA9132110aaB50DCa', // yzPp
  ],
}

const tvl = async (api) => {
  const contracts = CONFIG[api.chain]
  await api.erc4626Sum({ calls: contracts, tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets' })
}

module.exports = {
  methodology: `Aggregate of idle yzUSD, and yzPP`,
  misrepresentedTokens: true,
}

Object.keys(CONFIG).forEach(chain => module.exports[chain] = { tvl })