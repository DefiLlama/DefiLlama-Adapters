const { stakingPriceLP } = require('../helper/staking')

const xLNS = "0xBE7E034c86AC2a302f69ef3975e3D14820cC7660";
const LNS = "0x35b3Ee79E1A7775cE0c11Bd8cd416630E07B0d6f";
const WBCH_LNS_POOL = "0x7f3F57C92681c9a132660c468f9cdff456fC3Fd7";
const CHAIN = "smartbch";

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "LNS tokens locked in the staking contract are counted towards staking.",
  smartbch: {
    tvl: () => ({}),
    staking: stakingPriceLP(xLNS, LNS, WBCH_LNS_POOL)
  },
};
