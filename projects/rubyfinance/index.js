const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unknownTokens")
const { stakingUnknownPricedLP, staking } = require("../helper/staking")

const wkavaAddress = ADDRESSES.kava.WKAVA;
const rshareTokenAddress = "0x5547F680Ad0104273d0c007073B87f98dEF199c6";
const rshareRewardPoolAddress = "0x63c8069EE16BA666800cECaFd99f4C75ad6dd7Aa";
const boardroomAddress = "0x9832941dD0F80086399eC90eC6f6B2676791436a";
const rshareKavaLp = "0x0E5787F2550ddE3D394207aCeFdDe3f0228c7f79";
const rubyKavaLp = "0x41af8e310d639f3b91f640ab6d457c2302326e5c";
const rubyRshareLp = "0x96CB0E7fA38e5FDE6679B55afdfb8678D18f2680";
const rubyUsdcLp = "0x5FF7D68eE6e5f0bbE211B3c0d010160e3cD27Db9";

const Kavalps = [rubyKavaLp, rshareKavaLp, rubyRshareLp, rubyUsdcLp];

module.exports = {
  hallmarks: [
    [1660521600, "incentives not given"]
  ],
  methodology:
    "Pool2 deposits consist of RUBY/USDC, RUBY/KAVA, RSHARE/KAVA and RUBY/RSHARE LP deposits while the staking TVL consists of the RSHARE tokens locked within the Boardroom contract.",
  kava: {
    tvl: staking(rshareRewardPoolAddress, wkavaAddress),
    pool2: sumTokensExport({ owner: rshareRewardPoolAddress, tokens: Kavalps, lps: Kavalps, resolveLP: true, useDefaultCoreAssets: true }),
    staking: stakingUnknownPricedLP(boardroomAddress, rshareTokenAddress, "kava", rshareKavaLp),
  },
};