// Arenas curates Atomica credit pools. Lenders supply a stablecoin to a pool; the pool holds
// shares of its financing-market adapter, and the adapter holds the idle stablecoin and lends it
// to KYC-verified borrowers off-chain. Pools are listed by hand: a new pool needs a PR here.
const config = {
  robinhood: [
    '0x1f7cD3c08b56f74EA5bC3b35D989295b5f2E9056', // Arenas USDG RWA
  ],
  base: [
    '0x6bbbc3543e395d29e109b55a4553ad5dba144d01', // Arenas USDC RWA
  ],
}

async function getAdapters(api) {
  const pools = config[api.chain]
  const adapters = await api.multiCall({ abi: 'address:asset', calls: pools })
  const tokens = await api.multiCall({ abi: 'address:asset', calls: adapters })
  return { pools, adapters, tokens }
}

// Stablecoin held on-chain: idle liquidity in the adapters, plus any inflow still in the pools
async function tvl(api) {
  const { pools, adapters, tokens } = await getAdapters(api)
  return api.sumTokens({ tokensAndOwners: [...tokens.map((t, i) => [t, adapters[i]]), ...tokens.map((t, i) => [t, pools[i]])] })
}

// Principal lent to borrowers and not yet repaid (the adapter lowers it on repayment and write-off)
async function borrowed(api) {
  const { adapters, tokens } = await getAdapters(api)
  const outstanding = await api.multiCall({ abi: 'uint256:totalBorrowedPrincipal', calls: adapters })
  api.add(tokens, outstanding)
}

module.exports = {
  methodology: 'TVL is the stablecoin held on-chain by Arenas pools and their financing-market adapters (liquidity not yet lent). Principal lent to borrowers and not yet repaid is counted as borrowed.',
}
Object.keys(config).forEach(chain => module.exports[chain] = { tvl, borrowed })
