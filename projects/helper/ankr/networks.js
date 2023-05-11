const SupportedChainId = {
  MAINNET: 1,
  ROPSTEN: 3,
  MATIC: 137,
  MATIC_TESTNET: 80001,
  LOCAL_TESTNET: 31337,
  BSC: 56,
  FANTOM: 250,
  AVALANCHE: 0xa86a,
}

const SUPPORTED_NETWORKS = {
  [SupportedChainId.MAINNET]: {
    chainId: '0x1', //1
    chainName: 'Ethereum',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://mainnet.infura.io/v3'],
    blockExplorerUrls: ['https://etherscan.com'],
  },
  [SupportedChainId.BSC]: {
    chainId: '0x38', //56
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'Binance Coin',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com'],
  },
  [SupportedChainId.MATIC]: {
    chainId: '0x89', //137
    chainName: 'Matic',
    nativeCurrency: {
      name: 'Matic',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://explorer-mainnet.maticvigil.com'],
  },
  [SupportedChainId.FANTOM]: {
    chainId: '0xFA', //250
    chainName: 'Fantom',
    nativeCurrency: {
      name: 'FTM',
      symbol: 'FTM',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.ftm.tools/'],
    blockExplorerUrls: ['https://ftmscan.com/'],
  },
  [SupportedChainId.AVALANCHE]: {
    chainId: '0xa86a', //43114
    chainName: 'Avalanche',
    nativeCurrency: {
      name: 'AVAX',
      symbol: 'AVAX',
      decimals: 18,
    },
    rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
    blockExplorerUrls: ['https://avascan.info/blockchain/c/'],
  },
};

const ethereumRpcUrl = SUPPORTED_NETWORKS[SupportedChainId.MAINNET].rpcUrls[0];
const fantomRpcUrl = SUPPORTED_NETWORKS[SupportedChainId.FANTOM].rpcUrls[0];
const polygonRpcUrl = SUPPORTED_NETWORKS[SupportedChainId.MATIC].rpcUrls[0];
const avalancheRpcUrl = SUPPORTED_NETWORKS[SupportedChainId.AVALANCHE].rpcUrls[0];
const binanceRpcUrl = SUPPORTED_NETWORKS[SupportedChainId.BSC].rpcUrls[0];

module.exports = {
  SupportedChainId,
  SUPPORTED_NETWORKS,
  ethereumRpcUrl,
  fantomRpcUrl,
  polygonRpcUrl,
  avalancheRpcUrl,
  binanceRpcUrl,
}