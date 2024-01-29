const { sumTokens2 } = require("./helper/solana");

module.exports = {
  timetravel: false,
  methodology: "Calculate sum across all program token accounts",
  solana: {
    tvl,
  },
};

async function tvl(_, _b, _cb, { api }) {
  const vaults = [
    "BUvduFTd2sWFagCunBPLupG8fBTJqweLw9DuhruNFSCm", // SOL
    "WzWUoCmtVv7eqAbU3BfKPU3fhLP6CXR8NCJH78UK9VS", // USDC
    "Gex24YznvguMad1mBzTQ7a64U1CJy59gvsStQmNnnwAd", // USDT
    "Bgarxg65CEjN3kosjCW5Du3wEqvV3dpCGDR3a2HRQsYJ", // ETH
    "FgpXg2J3TzSs7w3WGYYE7aWePdrxBVLCXSxmAKnCZNtZ", // BTC
  ];

  return sumTokens2({ tokenAccounts: vaults });
}
