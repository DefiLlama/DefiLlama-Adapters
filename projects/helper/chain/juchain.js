const { ChainApi } = require('@defillama/sdk');

const CHAIN_CONFIG = {
  rpc: 'https://rpc.juchain.org',
  chainId: 'juchain',
  name: 'Juchain',
  decimals: 18,
  blockExplorerUrl: 'https://explorer.juscan.io',
  blockExplorerApiUrl: 'https://explorer.juscan.io',
  blockTime: 4,
  gasToken: 'JU',
  nativeCurrency: {
    name: 'Juchain',
    symbol: 'JU',
    decimals: 18
  }
};

ChainApi.addChain(CHAIN_CONFIG);

module.exports = {
  CHAIN_CONFIG
};
