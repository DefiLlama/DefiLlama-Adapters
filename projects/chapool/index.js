const ADDRESSES = require("../helper/coreAssets.json");

// ─── Contract addresses ────────────────────────────────────────────────────────
//
//  opBNB Mainnet (chainId 204)
//  Source: account-abstraction/deployments/opbnb/earn.json
//  (ChapoolVaultReader 0xd0B6693498489477346e20325BFB6d689945191D — not used here;
//   TVL uses sumTokens on the vault per DefiLlama review.)
//
const OPBNB = {
  EARN_VAULT: "0xA8C48A4443292a903BbAD19270dD268B9d42a546",
  VECPOT_LOCKER: "0xFACd2BB6332efDC116c48F4E952DF1a9515c8102",
  CPOT: "0x549d576069099F524A42ABa0b7CcB1b9b148B505",
  USDT: ADDRESSES.op_bnb.USDT,
};

async function tvl(api) {
  await api.sumTokens({
    owners: [OPBNB.EARN_VAULT],
    tokens: [OPBNB.USDT],
  });
}

async function staking(api) {
  await api.sumTokens({
    owners: [OPBNB.VECPOT_LOCKER],
    tokens: [OPBNB.CPOT],
  });
}

module.exports = {
  methodology:
    "TVL: USDT balance held by ChapoolEarnVault (1:1 custody; CPP rewards by weighted share). Staking: CPOT locked in VeCPOTLocker for veCPOT boost (up to +5% CPP rate).",
  op_bnb: {
    tvl,
    staking,
  },
};
