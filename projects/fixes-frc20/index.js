// Fixes Inscription Protocol - 𝔉rc20 Treasury Pool: https://fixes.world/
const { callCadence } = require("../helper/chain/flow");

let queryTVLCode = `
import FixesTVL from 0xd2abb5dbf5e08666

access(all)
fun main(): UFix64 {
    return FixesTVL.getAllTreasuryFlowValue()
}
`;

async function tvl() {
  try {
    const flowTokenTVL = await callCadence(queryTVLCode, true);
    return { flow: flowTokenTVL };
  } catch (error) {
    throw new Error(
      "Couln't query scripts of fixes 𝔉rc20 treasury pool. Error: " + error.message
    );
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "Counting the flow tokens locked in the treasury pool of each 𝔉rc20 token in the Fixes inscription protocol.",
  flow: {
    tvl,
  },
};
