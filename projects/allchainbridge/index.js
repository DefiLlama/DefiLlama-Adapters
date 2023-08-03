const ADDRESSES = require('../helper/coreAssets.json')
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
    BUSD: ADDRESSES.ethereum.BUSD,
    USDC: ADDRESSES.ethereum.USDC,
    USDT: ADDRESSES.ethereum.USDT,
    DAI: ADDRESSES.ethereum.DAI,
    HBTC: "0x0316EB71485b0Ab14103307bf65a021042c6d380",
    WETH: ADDRESSES.ethereum.WETH,
    SWFTC: "0x0bb217e40f8a5cb79adf04e1aab60e5abd0dfc1e",
    HT: "0x6f259637dcd74c767781e37bc6133cd6a68aa161",
  },
  bsc: {
    BNB: nullAddress,
    BUSD: ADDRESSES.bsc.BUSD,
    USDC: ADDRESSES.bsc.USDC,
    USDT: ADDRESSES.bsc.USDT,
    DAI: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
    WBNB: ADDRESSES.bsc.WBNB,
    BTCB: ADDRESSES.bsc.BTCB,
    ETH: ADDRESSES.bsc.ETH,
    SWFTC: "0xe64e30276c2f826febd3784958d6da7b55dfbad3",
    DOGE: "0xba2ae424d960c26247dd6c32edc70b295c744c43",
  },
  heco: {
    HT: nullAddress,
    USDC: ADDRESSES.heco.USDC_HECO,
    USDT: ADDRESSES.heco.USDT,
    HUSD: "0x0298c2b32eae4da002a15f36fdf7615bea3da047",
    ETH: "0x64ff637fb478863b7468bc97d30a5bf3a428a1fd",
    SWFTC: "0x329dda64Cbc4DFD5FA5072b447B3941CE054ebb3",
  },
  okexchain: {
    OKT: nullAddress,
    USDC: ADDRESSES.okexchain.USDC,
    USDT: ADDRESSES.okexchain.USDT,
    ETH: ADDRESSES.okexchain.ETHK,
    OKB: ADDRESSES.okexchain.OKB,
  },
  polygon: {
    MATIC: nullAddress,
    USDC: ADDRESSES.polygon.USDC,
    USDT: ADDRESSES.polygon.USDT,
    WMATIC: ADDRESSES.polygon.WMATIC_2,
  },
  fantom: {
    FTM: nullAddress,
    USDC: ADDRESSES.fantom.USDC,
    USDT: ADDRESSES.fantom.fUSDT,
    DAI: ADDRESSES.fantom.DAI,
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
