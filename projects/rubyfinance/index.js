const { getFixBalances } = require("../helper/portedTokens");
const { getTokenPrices } = require("../helper/unknownTokens")
const { stakingUnknownPricedLP } = require("../helper/staking")
const { sumTokens2 } = require('../helper/unwrapLPs')

const wkavaAddress = "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b";
const rshareTokenAddress = "0x5547F680Ad0104273d0c007073B87f98dEF199c6";
const rshareRewardPoolAddress = "0x63c8069EE16BA666800cECaFd99f4C75ad6dd7Aa";
const genesisPoolAddress = "0x0D6f8847EdB9ea4203241529ee753f6b26920f11";
const boardroomAddress = "0x87020747d28255029bA7696Ab9CF46a7a0e3a126";
const rshareKavaLp = "0x0E5787F2550ddE3D394207aCeFdDe3f0228c7f79";
const rubyKavaLp = "0xa76a3e6b9680339Da182eB81142B7974e16AbF1F";

const Kavalps = [rubyKavaLp, rshareKavaLp];

async function calcPool2(genesisPool, rewardPool, lps, block, chain) {
  let balances = {};
  const { updateBalances, } = await getTokenPrices({
    block, chain, coreAssets: [wkavaAddress], allLps: true, lps,
  })
  const toa = [...lps, wkavaAddress].map(token => [genesisPool, rewardPool].map(o => [token, o])).flat()
  await sumTokens2({ balances, tokensAndOwners: toa, block, chain, })
  await updateBalances(balances, { resolveLP: true  });
  (await getFixBalances(chain))(balances);
  return balances;
}

async function KavaPool2(timestamp, block, chainBlocks) {
  return calcPool2(genesisPoolAddress, rshareRewardPoolAddress, Kavalps, chainBlocks.kava, "kava");
}

module.exports = {
  methodology:
    "Pool2 deposits consist of RUBY/KAVA and RSHARE/KAVA LP and WKAVA tokens deposits while the staking TVL consists of the RSHARE tokens locked within the Boardroom contract.",
  kava: {
    tvl: async () => ({}),
    pool2: KavaPool2,
    staking: stakingUnknownPricedLP(boardroomAddress, rshareTokenAddress, "kava", rshareKavaLp),
  },
};
