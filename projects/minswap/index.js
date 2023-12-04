const { getAdaInAddress, sumTokensExport } = require("../helper/chain/cardano");

const POOL_SCRIPT_HASH = "script1uychk9f04tqngfhx4qlqdlug5ntzen3uzc62kzj7cyesjk0d9me"
const ORDER_SCRIPT_HASH = "script15ew2tzjwn364l2pszu7j5h9w63v2crrnl97m074w9elrkxhah0e"

async function tvl() {
  const liquidityPoolLocked = await getAdaInAddress(POOL_SCRIPT_HASH)
  const batchOrderLocked = await getAdaInAddress(ORDER_SCRIPT_HASH)
  return {
    cardano: (liquidityPoolLocked * 2) + batchOrderLocked,
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
