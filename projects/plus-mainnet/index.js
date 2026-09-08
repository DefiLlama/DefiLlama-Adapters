const { sumTokens2 } = require('../helper/unwrapLPs');

// Master Custody & Bridge Vault on Source Chains
const MASTER_VAULT_ETH = '0x5CfEa22674e2E7d251dEB693c0490b6389334F0f';
const MASTER_VAULT_BSC = '0x5CfEa22674e2E7d251dEB693c0490b6389334F0f';

// Clean Non-Native Collateral Assets
const USDT_ETH = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const USDT_BSC = '0x55d398326f99059fF775485246999027B3197955';

async function ethTvl(api) {
  return sumTokens2({
    api,
    owners: [MASTER_VAULT_ETH],
    tokens: [USDT_ETH]
  });
}

async function bscTvl(api) {
  return sumTokens2({
    api,
    owners: [MASTER_VAULT_BSC],
    tokens: [USDT_BSC]
  });
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "Calculates TVL by tracking real-time non-native USDT collateral locked in the PLUS Mainnet Bridge & Master Vault on Ethereum and BNB Chain (BSC). Native PoSA validator token staking is excluded from TVL per DefiLlama listing rules.",
  ethereum: {
    tvl: ethTvl,
  },
  bsc: {
    tvl: bscTvl,
  }
};
