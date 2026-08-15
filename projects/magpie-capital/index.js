const { sumTokens2 } = require("../helper/solana");

// Magpie Capital — permissionless collateral lending on Solana
// (memecoins, tokenized stocks/RWAs, collectibles). https://magpie.capital
//
// TVL = SOL lending liquidity held in the protocol's pool vaults (wSOL
// token accounts owned by each lending pool PDA):
//   V1 pool vault (program 4FEFPeMH68BbkrrZW2ak9wWXUS7JCkvXqBkGf5Bg6wmh)
//   V3 pool vault (program B8AwYzFmc3ZB5EWWVtJcJhJtEmKL78W5i3kZrL1uMCmP)
//   V4 pool vault (program HA1hgvskN1goEsb33rNHFBcDXBaYyLyyqfGwGMgTUwNo)
const POOL_VAULTS = [
  "5CYVDEqnLknmtyKkFEvpr5XnEJRzieXm1G5hSvYFG2Ko", // V1
  "s2M7st6DEepiuKhX3ouJM7mUsr8aDMJNm8UQh82KrVb", // V3
  "7vfpVHc2ndPYw9dToiag2ARoUZ75BjLLuzsEfSjMtD1w", // V4
];

async function tvl() {
  return sumTokens2({ tokenAccounts: POOL_VAULTS });
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is the SOL lending liquidity held in Magpie's on-chain pool vaults (wSOL token accounts owned by the V1, V3 and V4 lending-pool PDAs). Collateral locked against active loans is not counted.",
  solana: { tvl },
};
