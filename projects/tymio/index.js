const CHAIN = {
  Ethereum: 1,
  Arbitrum: 42161,
};
const TOKEN = {
  1: [
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  ],
  42161: [
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
    '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  ],
};
const CONTRACT = {
  1: '0xB67D637B1301EEb56Dba4555bBd15Cd220F1aaD6',
  42161: '0xB67D637B1301EEb56Dba4555bBd15Cd220F1aaD6',
};

async function tvl(api, chain_id) {
  for (const token_address of TOKEN[chain_id]) {
    const collateralBalance = await api.call({
      abi: 'erc20:balanceOf',
      target: token_address,
      params: [CONTRACT[chain_id]],
    });
    api.add(token_address, collateralBalance);
  }
}

module.exports = {
  methodology: 'Obtaining all authorized assets on deployed project contracts',
  ethereum: {
    start: 19573341,
    tvl: (api) => tvl(api, CHAIN.Ethereum),
  },
  arbitrum: {
    start: 192279731,
    tvl: (api) => tvl(api, CHAIN.Arbitrum),
  },
};
