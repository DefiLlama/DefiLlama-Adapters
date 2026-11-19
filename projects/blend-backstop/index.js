const { callSoroban } = require("../helper/chain/stellar");

const BACKSTOP_ID = "CAO3AGAMZVRMHITL36EJ2VZQWKYRPWMQAPDQD5YEOF3GIF7T44U4JAL3";
// Comet BLND:USDC 80/20 pool - the backstop token
const COMET = "CAS3FL6TLZKDGGSISDBWGGPXT3NRR4DYTZD7YOD3HMYO6LTJUVGRVEAM";

// backstop's share of the comet pool's underlying BLND + USDC, all on-chain
async function pool2(api) {
  const [lp, totalSupply, tokens] = await Promise.all([
    callSoroban(COMET, "balance", [BACKSTOP_ID]),
    callSoroban(COMET, "get_total_supply"),
    callSoroban(COMET, "get_tokens"),
  ]);
  for (const token of tokens) {
    const bal = await callSoroban(token, "balance", [COMET]);
    api.add(token, ((bal * lp) / totalSupply).toString());
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: `Counts the backstop contract's share of the BLND:USDC comet pool: its LP balance's proportional claim on the pool's underlying tokens, read on-chain.`,
  hallmarks: [
    ['2025-04-24', "Calculate TVL using BLND Coin Gecko price instead of approximation via pool weights"],
    ['2025-04-28', "Only account for lp tokens held by the backstop contract"],
  ],
  stellar: {
    tvl: () => ({}),
    pool2,
  },
};
