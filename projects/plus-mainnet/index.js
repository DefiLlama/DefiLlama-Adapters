const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokens2 } = require('../helper/unwrapLPs');

const STAKING_VAULTS = [
  '0x87a3A5E8383A31D6d07146b1a457dBd8d50de58D',
  '0x5CfEa22674e2E7d251dEB693c0490b6389334F0f'
];

async function staking(api) {
  return sumTokens2({
    api,
    owners: STAKING_VAULTS,
    tokens: [ADDRESSES.ethereum.USDT]
  });
}

module.exports = {
  methodology: "Calculates total value locked in PLUS Mainnet Staking Vaults dynamically from on-chain balances.",
  ethereum: {
    tvl: async () => ({}),
    staking
  }
};
