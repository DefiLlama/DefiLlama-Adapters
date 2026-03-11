const { ChainApi } = require('@defillama/sdk');

const CHAIN_CONFIG = {
  rpc: 'https://rpc.mainnet.ms',
  chainId: 'crossfi',
  name: 'CrossFi',
  decimals: 18,
  blockExplorerUrl: 'https://scan.mainnet.ms',
  blockExplorerApiUrl: 'https://scan.mainnet.ms/api',
  blockTime: 2,
  gasToken: 'XFI',
  nativeCurrency: {
    name: 'CrossFi',
    symbol: 'XFI',
    decimals: 18
  }
};

ChainApi.addChain(CHAIN_CONFIG);

module.exports = {
  CHAIN_CONFIG
}; 