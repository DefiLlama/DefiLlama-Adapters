const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs');
const { getCoreAssets } = require('../helper/tokenMapping');

const config = {
  ethereum: { 
    reserves: ['0x231278edd38b00b07fbd52120cef685b9baebcc1', '0x7f5c649856f900d15c83741f45ae46f5c6858234'],
    vesting: '0xFD235968e65B0990584585763f837A5b5330e6DE'
  },
  arbitrum: { 
    reserves: ['0xfa104eb3925a27e6263e05acc88f2e983a890637', '0xcb8b00d4018ad6031e28a44bf74616014bfb62ec'],
    vesting: '0x6b5360B419e0851b4b81644e0F63c1A9778f2506'
  },
  bsc: { 
    reserves: ['0x0D29598EC01fa03665feEAD91d4Fb423F393886c', '0xf1f7f21e2ea80ab110d0f95faa64655688341990'],
    vesting: '0xfe88DAB083964C56429baa01F37eC2265AbF1557'
  },
  polygon: { 
    reserves: ['0xc22218406983bf88bb634bb4bf15fa4e0a1a8c84', '0xd8207e9449647a9668ad3f8ecb97a1f929f81fd1'],
    vesting: '0x40f6301edb774e8B22ADC874f6cb17242BaEB8c4'
  },
};

module.exports = {
  misrepresentedTokens: true,
};

Object.keys(config).forEach(chain => {
  const { reserves, vesting } = config[chain];
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api }) => {
      const uniV3WhitelistedTokens = await getCoreAssets(api.chain);
      const tempBalances = await sumTokens2({ api, owners: reserves, resolveUniV3: true, uniV3WhitelistedTokens });
      const balances = {};
      Object.entries(tempBalances).forEach(([token, balance]) => sdk.util.sumSingleBalance(balances, token, balance * 2));
      return balances;
    },
    vesting: async (_, _b, _cb, { api }) => {
      const uniV3WhitelistedTokens = await getCoreAssets(api.chain);
      const tempBalances = await sumTokens2({ api, owners: [vesting], resolveUniV3: true, uniV3WhitelistedTokens });
      const balances = {};
      Object.entries(tempBalances).forEach(([token, balance]) => sdk.util.sumSingleBalance(balances, token, balance));
      return balances;
    }
  };
});
