const { calculateUsdUniTvlPairs } = require('../helper/getUsdUniTvl')
const { stakingPricedLP } = require('../helper/staking')

const xLNS = "0xBE7E034c86AC2a302f69ef3975e3D14820cC7660";
const LNS = "0x35b3Ee79E1A7775cE0c11Bd8cd416630E07B0d6f";
const WBCH = "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04";
const WBCH_LNS_POOL = "0x7f3F57C92681c9a132660c468f9cdff456fC3Fd7";
const CHAIN = "smartbch";

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "TVL is equal to the liquidity on the trading dex. LNS tokens locked in staking contract are counted towards staking.",
  smartbch: {
    tvl: calculateUsdUniTvlPairs([WBCH_LNS_POOL], CHAIN, WBCH, [LNS], "bitcoin-cash", 18),
    staking: stakingPricedLP(xLNS, LNS, "smartbch", WBCH_LNS_POOL, "bitcoin-cash", false, 18)
  },
};
