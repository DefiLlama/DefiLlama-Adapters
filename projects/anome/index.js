const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const BSC_MARKET_CONTRACT = '0x210d75B7C94aDf9FC1a2bCd047D76890479234e3'; 
const BSC_USDT = ADDRESSES.bsc.USDT;            

module.exports = {
  bsc: {
    tvl: sumTokensExport({ 
        owner: BSC_MARKET_CONTRACT, 
        tokens: [BSC_USDT] 
    }),
  }
};