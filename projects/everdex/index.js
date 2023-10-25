const ADDRESSES = require('../helper/coreAssets.json');
const { getUniTVL } = require("../helper/unknownTokens");
const { sumTokens2, } = require('../helper/unwrapLPs');
const sdk = require('@defillama/sdk');

const chain = 'bfc'

// 3-pools
const tokensAndOwners = [
    // stablePoolDaiUsdcUsdt
    [ADDRESSES.bfc.UnifiedDAI, '0xa455434802d8B530C77d2B7547eF93C798896581'],
    [ADDRESSES.bfc.UnifiedUSDC, '0xa455434802d8B530C77d2B7547eF93C798896581'],
    [ADDRESSES.bfc.UnifiedUSDT, '0xa455434802d8B530C77d2B7547eF93C798896581'],
]

async function tvl() {
    return sumTokens2({ tokensAndOwners, chain });
}

const uniTVL = getUniTVL({ factory: '0x19f21b0AB98EC10d734E314356Ad562ae349177d', useDefaultCoreAssets: true, chain});


module.exports = {
  misrepresentedTokens: true,
  start: 1674864000,
  bfc: {
    tvl: sdk.util.sumChainTvls([tvl, uniTVL])
  },
};