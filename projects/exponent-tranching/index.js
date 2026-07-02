const {
  getTranchingMarkets,
  getTranchingMarketTokenMints,
  getTranchingNavBySyMint,
} = require("./helpers");

async function tvl(api) {
  const markets = await getTranchingMarkets()
  const marketTokenMints = await getTranchingMarketTokenMints(markets)
  const navBySyMint = getTranchingNavBySyMint(markets)

  for (const [syMint, amount] of Object.entries(navBySyMint)) {
    const tokenMint = marketTokenMints[syMint]
    if (!tokenMint) continue

    api.add(tokenMint.toBase58(), amount.toString())
  }
}

module.exports = {
  timetravel: false,
  // Exponent core subtracts this same tranching NAV, so this adapter should remain countable on its own.
  methodology: 'TVL is calculated from on-chain data by summing each visible tranching market\'s senior and junior effective NAV. Generic SY markets are attributed to their on-chain yield-bearing mint; other markets fall back to their SY mint.',
  solana: { tvl },
};
