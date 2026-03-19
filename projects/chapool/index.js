const ADDRESSES = require("../helper/coreAssets.json");

// ─── Contract addresses ────────────────────────────────────────────────────────
//
//  opBNB Mainnet (chainId 204)
//  Source: account-abstraction/deployments/opbnb/earn.json
//
const OPBNB = {
  // ChapoolVaultReader — aggregates all Earn data in a single call
  VAULT_READER: "0xd0B6693498489477346e20325BFB6d689945191D",

  // ChapoolEarnVault — USDT custody + CPP accumulator
  EARN_VAULT: "0xA8C48A4443292a903BbAD19270dD268B9d42a546",

  // VeCPOTLocker — CPOT is locked here for veCPOT boost
  VECPOT_LOCKER: "0xFACd2BB6332efDC116c48F4E952DF1a9515c8102",

  // CPOT governance token locked in VeCPOTLocker
  CPOT: "0x549d576069099F524A42ABa0b7CcB1b9b148B505",

  // USDT — sourced from DefiLlama coreAssets (0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3)
  USDT: ADDRESSES.op_bnb.USDT,
};

// ─── ABIs ─────────────────────────────────────────────────────────────────────
//
//  ChapoolVaultReader.getTVL()        → uint256  (total USDT in EarnVault, 18 dec)
//  ChapoolEarnVault.totalVaultAssets() → uint256 (same, used as fallback)
//
const abi = {
  getTVL: "function getTVL() view returns (uint256)",
  totalVaultAssets: "function totalVaultAssets() view returns (uint256)",
};

// ─── TVL builder ──────────────────────────────────────────────────────────────
function buildTvl(addrs) {
  return async (api) => {
    // ── Source 1: USDT deposited in ChapoolEarnVault ──────────────────────────
    //
    //  Prefer VaultReader.getTVL() — one RPC call, purpose-built for indexers.
    //  Falls back to EarnVault.totalVaultAssets() if VaultReader is unavailable.
    //
    if (addrs.VAULT_READER) {
      const usdtLocked = await api.call({
        target: addrs.VAULT_READER,
        abi: abi.getTVL,
      });
      api.add(addrs.USDT, usdtLocked);
    } else if (addrs.EARN_VAULT) {
      const usdtLocked = await api.call({
        target: addrs.EARN_VAULT,
        abi: abi.totalVaultAssets,
      });
      api.add(addrs.USDT, usdtLocked);
    }

    // ── Source 2: CPOT locked in VeCPOTLocker ────────────────────────────────
    //
    //  Users lock CPOT to earn veCPOT boost (+1% ~ +5% on CPP emission rate).
    //  The locker custodies the CPOT — its balance equals total locked CPOT.
    //
    if (addrs.VECPOT_LOCKER && addrs.CPOT) {
      await api.sumTokens({
        owners: [addrs.VECPOT_LOCKER],
        tokens: [addrs.CPOT],
      });
    }
  };
}

// ─── Module export ─────────────────────────────────────────────────────────────
module.exports = {
  methodology:
    "TVL: (1) USDT in ChapoolEarnVault — 1:1 custody, no USDT yield; users earn CPP by weighted share (veCPOT + NFT boost). (2) CPOT locked in VeCPOTLocker — veCPOT boosts CPP rate (cap +5%).",
  op_bnb: {
    tvl: buildTvl(OPBNB),
  },
};

