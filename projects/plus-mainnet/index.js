const { sumTokens2 } = require('../helper/unwrapLPs');

// Single Public Master Treasury Vault (Publicly Verified on CertiK & DefiLlama)
const MASTER_VAULT = '0x5CfEa22674e2E7d251dEB693c0490b6389334F0f';

// External Non-Native USDT Collateral Tokens (Ethereum & BSC)
const USDT_ETH = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const USDT_BSC = '0x55d398326f99059fF775485246999027B3197955';

async function ethereumTreasury(api) {
  return sumTokens2({
    api,
    owners: [MASTER_VAULT],
    tokens: [USDT_ETH]
  });
}

async function bscTreasury(api) {
  return sumTokens2({
    api,
    owners: [MASTER_VAULT],
    tokens: [USDT_BSC]
  });
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "Tracks non-native external USDT collateral held in the official Master Treasury Vault across Ethereum and BSC networks.",
  ethereum: {
    tvl: () => ({}),
    treasury: ethereumTreasury
  },
  bsc: {
    tvl: () => ({}),
    treasury: bscTreasury
  }
};
