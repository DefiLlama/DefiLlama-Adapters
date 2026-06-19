const { staking } = require("../helper/staking");
const { Pools, SRS, VotingEscrow } = require("./constants");

async function tvl(api) {
  const ownerTokens = []

  for (const [o, ts] of Object.entries(Pools))
    ownerTokens.push([ts, o])
  return api.sumTokens({ ownerTokens, })
}

module.exports = {
  methodology: "All locked tokens includes stable and crypto assets in Sirius's pools.",
  astar: {
    start: '2022-04-16', // 2022/04/16 14:00 UTC
    tvl, // tvl adapter
    staking: staking(VotingEscrow, SRS),
  },
};
