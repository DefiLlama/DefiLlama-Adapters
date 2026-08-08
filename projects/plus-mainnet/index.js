const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

// PLUS Mainnet Staking Smart Contract (PlusStaking.sol)
const STAKING_CONTRACT = '0x5CfEa22674e2E7d251dEB693c0490b6389334F0f';

async function staking(api) {
  return sumTokens2({
    api,
    owners: [STAKING_CONTRACT],
    tokens: [ADDRESSES.ethereum.USDT]
  });
}

module.exports = {
  methodology: "Calculates total value locked in PLUS Mainnet Staking Smart Contracts dynamically from on-chain balances.",
  ethereum: {
    tvl: async () => ({}),
    staking
  }
};
