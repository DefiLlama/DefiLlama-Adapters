const ADDRESSES = require("../helper/coreAssets.json");

// ─── Contract addresses ────────────────────────────────────────────────────────
//
//  opBNB Mainnet (chainId 204)
//  Update these once EARN contracts are deployed to mainnet.
//  Testnet reference: deployments/opbnbTestnet/earn.json
//
const OPBNB = {
  // ChapoolVaultReader — aggregates all Earn data in a single call
  VAULT_READER: "",   // TODO: deploy on opBNB mainnet

  // ChapoolEarnVault — USDT custody + CPP accumulator
  EARN_VAULT: "",     // TODO: deploy on opBNB mainnet

  // VeCPOTLocker — CPOT is locked here for veCPOT boost
  VECPOT_LOCKER: "",  // TODO: deploy on opBNB mainnet

  // CPOT governance token locked in VeCPOTLocker
  CPOT: "",           // TODO: set CPOT mainnet token address

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
    "TVL consists of two components: " +
    "(1) USDT deposited in ChapoolEarnVault — users earn CPP rewards proportional " +
    "to their weighted USDT share; balance is read via ChapoolVaultReader.getTVL(). " +
    "(2) CPOT locked in VeCPOTLocker — users lock CPOT to receive a veCPOT " +
    "boost (up to +5%) on their CPP emission rate; balance is read from the locker " +
    "contract directly. No USDT yield is generated — deposits are returned 1:1.",

  op_bnb: {
    tvl: buildTvl(OPBNB),
  },
};
