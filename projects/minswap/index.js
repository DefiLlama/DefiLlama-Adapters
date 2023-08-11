const { getAdaInAddress } = require("../helper/chain/cardano");

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
  },
  hallmarks:[
    [1647949370, "Vulnerability Found"],
  ],
};
