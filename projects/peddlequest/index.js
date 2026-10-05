const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

// PeddlesQuestEscrow: holds every quest's reward pool from deposit until it is
// claimed by winners or swept after the claim deadline. Immutable, no proxy,
// deployed at the same address on every chain.
// https://basescan.org/address/0x16267bE6D067b3d411bf779B5aD041f9eba4CadE
const ESCROW = "0x16267bE6D067b3d411bf779B5aD041f9eba4CadE";

// Reward assets the escrow accepts: the chain's gas token (always) plus the
// ERC-20s its owner allow-listed, i.e. every asset with a
// `RewardAssetSet(asset, true)` event / `isRewardAsset(asset) == true`.
const config = {
  base: [nullAddress, ADDRESSES.base.USDC],
  bsc: [nullAddress, ADDRESSES.bsc.USDT, ADDRESSES.bsc.USDC],
  robinhood: [nullAddress],
  // Arc's gas token is USDC, and the USDC ERC-20 (0x3600...0000) is a view of
  // the same native balance: listing both would count every pool twice.
  arc: [nullAddress],
};

module.exports = {
  methodology:
    "Reward pools that quest creators have deposited into the PeddlesQuestEscrow contract and that have not yet been claimed by winners or swept after the claim deadline. Counts the escrow's balance of the chain's gas token and of every allow-listed reward token.",
  start: "2026-10-02",
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl: sumTokensExport({ owner: ESCROW, tokens: config[chain] }) };
});
