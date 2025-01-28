// Fixes Inscription Protocol - Staking Pool: https://fixes.world/
const { callCadence } = require("../helper/chain/flow");

let queryTVLCode = `
import FixesTVL from 0xd2abb5dbf5e08666

access(all)
fun main(): UFix64 {
    return FixesTVL.getAllStakedFlowValue()
}
`;

async function tvl() {
  try {
    const flowTokenTVL = await callCadence(queryTVLCode, true);
    return { flow: flowTokenTVL };
  } catch (error) {
    console.error(error.message);
    throw new Error(
      "Couln't query scripts of fixes 𝔉rc20 treasury pool. Error: " + error.message
    );
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "Counting the 𝔉rc20 tokens staked by users in the Fixes inscription protocol, and tokens locked by unstaking are not counted.",
  flow: {
    tvl,
  },
};
