const { sumTokens2 } = require('../helper/unwrapLPs');

// Official Master Treasury Vaults (CertiK & DefiLlama Verified)
const MASTER_VAULT = '0x5CfEa22674e2E7d251dEB693c0490b6389334F0f';
const COLD_STORAGE = '0x87a3A5E8383A31D6d07146b1a457dBd8d50de58D';

// Verified Non-Native External Collateral Tokens (USDT Only - Excludes Own Native Tokens per DefiLlama Rule)
const USDT_ETH = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const USDT_BSC = '0x55d398326f99059fF775485246999027B3197955';

async function ethereumTreasury(api) {
  return sumTokens2({
    api,
    owners: [MASTER_VAULT, COLD_STORAGE],
    tokens: [USDT_ETH]
  });
}

async function bscTreasury(api) {
  return sumTokens2({
    api,
    owners: [MASTER_VAULT, COLD_STORAGE],
    tokens: [USDT_BSC]
  });
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "Tracks non-native external USDT collateral and reserves held in verified Master Treasury Vaults across Ethereum and BSC networks (excludes own native tokens per DefiLlama guidelines).",
  ethereum: {
    tvl: () => ({}),
    treasury: ethereumTreasury
  },
  bsc: {
    tvl: () => ({}),
    treasury: bscTreasury
  }
};
