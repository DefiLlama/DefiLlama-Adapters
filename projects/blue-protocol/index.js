const { sumTokens2 } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

// ============ BSC ============
const bscStaking = "0xD245f811d2B8e94aA4EC23D430017d7EfE390439";
const bscTreasury = "0xC2d2D7eB9cbF2985714E3310bFDB8eEcC3E96992";

const bscTokens = {
  BLUE: "0xa90298e5B1203A2DD0006A75EABE158989C406Fb",
};

// Treasury tokens on BSC (add addresses here)
const bscTreasuryTokens = [
  ADDRESSES.bsc.USDT,
  ADDRESSES.bsc.USDC,
  ADDRESSES.bsc.ETH,
  "0xC9Ad421f96579AcE066eC188a7Bba472fB83017F",
  "0x149b55D78f6380Af73FFe57e9aDb7F1963BC251a",
  "0xeb7fE075B7677c98C75E105d4f5ACE0e19505567"
  // "0x...", // LP tokens, other assets
];

// ============ Abstract ============
const abstractProtocolWallet = "0x111111f26ab123764Da895e1627bf9Ba0b000a97";

const abstractTokens = {
  gBLUE: "0xC25714E79B694EEe7E8E8d21Dae332A797d28Ac0",
};

// Tokens/LPs to track on Abstract (add addresses here)
const abstractTreasuryTokens = [
  ADDRESSES.abstract.WETH,
  ADDRESSES.abstract.USDC,
  ADDRESSES.abstract.USDT,
  "0xC25714E79B694EEe7E8E8d21Dae332A797d28Ac0",
  "0x46401D8303D7355339A21479459260F4D93D9349", // BLUE-ETH LP
  // "0x...", // other tokens
];

// ERC4626 vaults on Abstract (add vault addresses here)
// These will automatically call totalAssets() and unwrap underlying LPs
const abstractERC4626Vaults = [
   "0x5a993c926b9c15ee1651282094f8e8314809b916", // gBLUE-ETH LP vault
];

module.exports = {
  methodology: "Counts staked BLUE tokens and treasury holdings. gBLUE is excluded from Abstract TVL to avoid double counting staked BLUE.",
  bsc: {
    staking: async (api) => {
      return sumTokens2({
        api,
        owners: [bscStaking],
        tokens: [bscTokens.BLUE],
      });
    },
    tvl: async (api) => {
      if (bscTreasuryTokens.length === 0) return {};
      return sumTokens2({
        api,
        owners: [bscTreasury],
        tokens: bscTreasuryTokens,
        resolveLP: true,
        blacklistedTokens: [bscTokens.BLUE], // Exclude BLUE to avoid double counting
      });
    },
  },
  abstract: {
    tvl: async (api) => {
      // Sum ERC4626 vaults (converts shares to underlying assets)
      // Uses pool() instead of asset() for underlying token
      if (abstractERC4626Vaults.length > 0) {
        await api.erc4626Sum({
          calls: abstractERC4626Vaults,
          tokenAbi: 'address:pool',
          balanceAbi: 'uint256:totalAssets',
        });
      }

      // Sum regular tokens in protocol wallet
      if (abstractTreasuryTokens.length > 0) {
        await sumTokens2({
          api,
          owners: [abstractProtocolWallet],
          tokens: abstractTreasuryTokens,
        });
      }

      // Unwrap any LPs and exclude gBLUE
      return sumTokens2({
        api,
        resolveLP: true,
        blacklistedTokens: [abstractTokens.gBLUE], // Exclude gBLUE to avoid double counting
      });
    },
  },
};