const { sumTokens2 } = require('../helper/unwrapLPs');
const { getCoreAssets } = require('../helper/tokenMapping');

const config = {
  ethereum: {
    reserves: ['0x231278edd38b00b07fbd52120cef685b9baebcc1', '0x7f5c649856f900d15c83741f45ae46f5c6858234', '0xFD235968e65B0990584585763f837A5b5330e6DE', '0x7fccf17620ce18c039eb3485628e5c50d2ae1cec'],
  },
  arbitrum: {
    reserves: ['0xfa104eb3925a27e6263e05acc88f2e983a890637', '0xcb8b00d4018ad6031e28a44bf74616014bfb62ec', '0x6b5360B419e0851b4b81644e0F63c1A9778f2506', '0x2a91f1088bca423ee17f5590fcc36f372458cea1'],
  },
  bsc: {
    reserves: ['0x0D29598EC01fa03665feEAD91d4Fb423F393886c', '0xf1f7f21e2ea80ab110d0f95faa64655688341990', '0xfe88DAB083964C56429baa01F37eC2265AbF1557', '0xac03f882a41553fb2d519b35874b0a551977b9d9'],
  },
  polygon: {
    reserves: ['0xc22218406983bf88bb634bb4bf15fa4e0a1a8c84', '0xd8207e9449647a9668ad3f8ecb97a1f929f81fd1', '0x40f6301edb774e8B22ADC874f6cb17242BaEB8c4'],
  },
  base: {
    reserves: ['0xd6cd8fb001cbdae91f0af7a58a1602c945967d67', '0x231278edd38b00b07fbd52120cef685b9baebcc1', '0xb403e68eb5bffd7df7aa127f5a819f77c2f96095']
  },
  celo: {
    reserves: ['0xb108d212d1aedf054354e7e707eab5bce6e029c6'],
  },
  optimism: {
    reserves: ['0x1ce6d27f7e5494573684436d99574e8288ebbd2d'],
  },
  hyperliquid: {
    reserves: ['0x7b21d8db3cec21fd0e88b08aba0cd63ea15e708b'],
  },
  unichain: {
    reserves: ['0xcb399f22b923f6ec9fe7be15a99dd2df0a9822c8'],
  }
};

module.exports = {
  misrepresentedTokens: true,
};

Object.keys(config).forEach(chain => {
  const { reserves, } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const uniV3WhitelistedTokens = await getCoreAssets(api.chain);
      await sumTokens2({ api, owners: reserves, resolveUniV3: true, uniV3WhitelistedTokens, });
      return api.getBalancesV2().clone(2).getBalances() // we multiple core assets value by 2 as positions are spread between 0 -  ∞ 
    },
  };
  });//
