const { sumTokens2, nullAddress, } = require('../helper/unwrapLPs')

const getBridgeContract = (chain) => {
  switch (chain) {
    case 'ethereum':
      return '0x92e929d8b2c8430bcaf4cd87654789578bb2b786';
    case 'bsc':
      return '0x1ed5685f345b2fa564ea4a670de1fde39e484751';
    case 'heco':
      return '0xaeAE2CBb1E024E27e80cc61eE9A8B300282209B4';
    case 'okexchain':
      return '0x37809F06F0Daf8f1614e8a31076C9bbEF4992Ff9';
    case 'polygon':
      return '0x242Ea2A8C4a3377A738ed8a0d8cC0Fe8B4D6C36E';
    case 'fantom':
      return '0x8f957ed3f969d7b6e5d6df81e61a5ff45f594dd1';
    case 'kava':
      return '0xa62a9c5cC8B92E00AB269BcA9f5539617AA65863';
    default:
      throw new Error('Missing bridge contract');
  }
}

/*
 * TOKEN CONFIGURATION
 * ADD TOKENS AND NETWORKS HERE
 */

const tokensConf = {
  ethereum: {
    ETH: nullAddress,
    BUSD: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
    USDC: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    USDT: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    DAI: "0x6b175474e89094c44da98b954eedeac495271d0f",
    HBTC: "0x0316EB71485b0Ab14103307bf65a021042c6d380",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    SWFTC: "0x0bb217e40f8a5cb79adf04e1aab60e5abd0dfc1e",
    HT: "0x6f259637dcd74c767781e37bc6133cd6a68aa161",
  },
  bsc: {
    BNB: nullAddress,
    BUSD: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    USDT: "0x55d398326f99059fF775485246999027B3197955",
    DAI: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
    WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    BTCB: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
    ETH: "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
    SWFTC: "0xe64e30276c2f826febd3784958d6da7b55dfbad3",
    DOGE: "0xba2ae424d960c26247dd6c32edc70b295c744c43",
  },
  heco: {
    HT: nullAddress,
    USDC: "0x9362bbef4b8313a8aa9f0c9808b80577aa26b73b",
    USDT: "0xa71edc38d189767582c38a3145b5873052c3e47a",
    HUSD: "0x0298c2b32eae4da002a15f36fdf7615bea3da047",
    ETH: "0x64ff637fb478863b7468bc97d30a5bf3a428a1fd",
    SWFTC: "0x329dda64Cbc4DFD5FA5072b447B3941CE054ebb3",
  },
  okexchain: {
    OKT: nullAddress,
    USDC: "0xc946daf81b08146b1c7a8da2a851ddf2b3eaaf85",
    USDT: "0x382bb369d343125bfb2117af9c149795c6c65c50",
    ETH: "0xef71ca2ee68f45b9ad6f72fbdb33d707b872315c",
    OKB: "0xdf54b6c6195ea4d948d03bfd818d365cf175cfc2",
  },
  polygon: {
    MATIC: nullAddress,
    USDC: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
    USDT: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
    WMATIC: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
  },
  fantom: {
    FTM: nullAddress,
    USDC: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",
    USDT: "0x049d68029688eabf473097a2fc38ef61633a3c7a",
    DAI: "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e",
    WETH: "0x74b23882a30290451A17c44f4F05243b6b58C76d",
  },
  kava: {
    KAVA: nullAddress,
  },
};

/*
 * END OF CONFIGURATION
 */

const createTvlFunction = (chain) => async (timestamp, block, chainBlocks) => {
  const bridgeContract = getBridgeContract(chain);
  const tokens = Object.values(tokensConf[chain])
  const owners = [bridgeContract]
  return sumTokens2({ chain, block:chainBlocks[chain], tokens, owners, })
};

module.exports = {
  methodology: "Assets staked in the pool and trading contracts",
}
for (const network of Object.keys(tokensConf)) {
  module.exports[network] = {
    tvl: createTvlFunction(network),
  };
}
