// Flow Rewards Platform: https://rewards.flow.com/

const { post } = require("../helper/http");

let queryTVLCode = `
import FlowRewards from 0xa45ead1cf1ca9eda

/// Gets the total value locked in the FlowRewards contract
///
/// @return The total value locked in the FlowRewards contract
///
access(all)
fun main(): UFix64 {
    return FlowRewards.getTotalValueLocked()
}
`;

const queryCodeBase64 = Buffer.from(queryTVLCode, "utf-8").toString("base64");

async function tvl() {
  try {
    const response = await post(
      "https://rest-mainnet.onflow.org/v1/scripts",
      { script: queryCodeBase64 },
      {
        headers: { "content-type": "application/json" },
      }
    );
    let resEncoded = response;
    let resString = Buffer.from(resEncoded, "base64").toString("utf-8");
    let resJson = JSON.parse(resString);
    let flowTokenTVL = Number(resJson.value);

    return { flow: flowTokenTVL };
  } catch (error) {
    throw new Error(
      "Couln't query scripts of fixes 𝔉rc20 treasury pool",
      error
    );
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "Counting the flow tokens locked in the FLOW Community Rewards Platform (all $FLOW will be locked in FlowRewards NFT).",
  flow: {
    tvl,
  },
};
