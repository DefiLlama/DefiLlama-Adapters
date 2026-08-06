const STAKING_VAULTS = [
  '0x87a3A5E8383A31D6d07146b1a457dBd8d50de58D',
  '0x5CfEa22674e2E7d251dEB693c0490b6389334F0f'
];
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

async function staking(api) {
  await api.sumTokens({ owners: STAKING_VAULTS, tokens: [USDT] });
}

module.exports = {
  methodology: "Calculates total value locked in PLUS Mainnet Staking Vaults dynamically from on-chain RPC balances.",
  ethereum: {
    tvl: async () => ({}),
    staking
  }
};
