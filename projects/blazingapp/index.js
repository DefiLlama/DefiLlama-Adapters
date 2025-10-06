// Minimal placeholder adapter: reports zero TVL while we wire real contracts.
// This lets us submit the PR and iterate addresses quickly with maintainers.

async function tvl() {
  return {};
}

module.exports = {
  timetravel: false,
  methodology: "Placeholder adapter. We will compute fees and TVL from on-chain deployed routers listed in the PR description.",
  start: 1731946483,
  ethereum: { tvl },
  base: { tvl },
  bsc: { tvl },
  avalanche: { tvl },
  berachain: { tvl },
  sonic: { tvl },
  solana: { tvl },
  story: { tvl },
};


