const { sumTokensExport } = require("../helper/solana");

// Soul Reaper — Provably fair gamified mining on Solana
// Program ID: HKPj22otN2crrNS7buiJFFKsE6r98GHFmuBjMywxhZ7A
//
// TVL = SOL locked in:
//   1. Treasury PDA  — game deposits, jackpot payouts, house bankroll
//   2. LP Fund PDA   — SOL allocated for SOUL/SOL liquidity provisioning
//
// Player vaults are individual PDAs holding deposited SOL during active sessions.
// They are tracked as part of the Treasury balance (funds flow Treasury <-> Player Vault).

const TREASURY_PDA = "C3DdpRWF3Vkz1T3boxf37jjoDJqW4MdiwydauppGiV3C";
const LP_FUND_PDA = "3kXCCXr7WaEgh2iM7TMS1CTrvPE1T7rgTqnJZnDrya5N";

module.exports = {
  timetravel: false,
  methodology:
    "TVL is the total SOL held in the Soul Reaper Treasury and LP Fund program-derived accounts (PDAs). " +
    "The Treasury holds player deposits, jackpot reserves, and house bankroll. " +
    "The LP Fund holds SOL earmarked for SOUL/SOL liquidity pool seeding.",
  solana: {
    tvl: sumTokensExport({
      solOwners: [TREASURY_PDA,],
    }),
  },
};
