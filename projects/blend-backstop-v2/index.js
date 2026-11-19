const { callSoroban } = require("../helper/chain/stellar");

const BACKSTOP_ID = "CAQQR5SWBXKIGZKPBZDH3KM5GQ5GUTPKB7JAFCINLZBC5WXPJKRG3IM7";
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
  methodology: `Counts the Blend V2 backstop contract's share of the BLND:USDC comet pool: its LP balance's proportional claim on the pool's underlying tokens, read on-chain.`,
  stellar: {
    tvl: () => ({}),
    pool2,
  },
};
