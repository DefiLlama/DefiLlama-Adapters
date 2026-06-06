const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unknownTokens");

const DEATH_FUN_CONTRACT = "0x27EDd16eE56958fddCBA08947f12C43DDeC2B20C";

// Native token placeholder used by DefiLlama helpers for native ETH-like balances.
const NATIVE_TOKEN = ADDRESSES.null;

module.exports = {
  start: 1748022475, // 2025-05-23 17:47:55 UTC

  methodology:
    "Death.fun TVL is the native ETH held in the Death.fun game contract, which serves as the house bankroll used to pay player cashouts. Direct bankroll deposits and owner withdrawals affect TVL because they change the contract balance, but they are treasury movements rather than game outcomes.",

  abstract: {
    tvl: sumTokensExport({
      owners: [DEATH_FUN_CONTRACT],
      tokens: [NATIVE_TOKEN],
    }),
  },
};