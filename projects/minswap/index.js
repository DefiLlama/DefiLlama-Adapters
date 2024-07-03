const { getAdaInAddress, sumTokensExport, sumTokens2 } = require("../helper/chain/cardano");

const POOL_SCRIPT_HASH = "script1uychk9f04tqngfhx4qlqdlug5ntzen3uzc62kzj7cyesjk0d9me"
const ORDER_SCRIPT_HASH = "script15ew2tzjwn364l2pszu7j5h9w63v2crrnl97m074w9elrkxhah0e"

async function tvl() {
  // DEX V1
  const liquidityPoolLocked = await getAdaInAddress(POOL_SCRIPT_HASH)
  const batchOrderLocked = await getAdaInAddress(ORDER_SCRIPT_HASH)
  
  // Stable Pools
  const stablePoolsLiquidity = await sumTokens2({ 
    owners: [
      'addr1wy7kkcpuf39tusnnyga5t2zcul65dwx9yqzg7sep3cjscesx2q5m5',
      'addr1wx8d45xlfrlxd7tctve8xgdtk59j849n00zz2pgyvv47t8sxa6t53',
      'addr1w9520fyp6g3pjwd0ymfy4v2xka54ek6ulv4h8vce54zfyfcm2m0sm',
      'addr1wxxdvtj6y4fut4tmu796qpvy2xujtd836yg69ahat3e6jjcelrf94',
    ], 
    tokens: [
      '8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61446a65644d6963726f555344',
      'f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b6988069555344',
      '25c5de5f5b286073c593edfd77b48abc7a48e5a4f3d4cd9d428ff93555534443',
      'c48cbb3d5e57ed56e276bc45f99ab39abe94e6cd7ac39fb402da47ad0014df105553444d'
    ],
  })

  return {
    cardano: (liquidityPoolLocked * 2) + batchOrderLocked,
    ...stablePoolsLiquidity
  };
}

module.exports = {
  timetravel: false,
  cardano: {
    tvl,
    staking: sumTokensExport({ 
      owner: 'addr1wy3fscaws62d59k6qqhg3xsarx7vstzczgjmdhx2jh7knksj7w3y7', 
      tokens: ['29d222ce763455e3d7a09a665ce554f00ac89d2e99a1a83d267170c64d494e']
    })
  },
  hallmarks:[
    [1647949370, "Vulnerability Found"],
  ],
};
