const { staking } = require("../helper/staking");
const { gql, request } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");

const templeStakingContract = "0x4D14b24EDb751221B3Ff08BBB8bd91D4b1c8bc77";
const TEMPLE = "0x470ebf5f030ed85fc1ed4c2d36b9dd02e77cf1b7";

const protocolQuery = gql`
query get_tvl($block: Int) {
  protocolMetrics(
    first: 1, orderBy: timestamp, orderDirection: desc
  ) {
    lockedStables
    timestamp
  }
}
`

/*** TVL Portion (Treasury) ***
 * Treasury TVL consists of stables from TEMPLE-FRAX AMM LP, Temple Defend and FRAX+3CRV LP
 ***/
async function ethTvl(timestamp, block) {
  const queriedData = await request("https://api.thegraph.com/subgraphs/name/templedao/templedao-metrics", protocolQuery, {block})
  const metric = queriedData.protocolMetrics[0]
  if(Date.now()/1000 - metric.timestamp > 3600*24){
    throw new Error("outdated")
  }
  return toUSDTBalances(metric.lockedStables)
}

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    staking: staking(templeStakingContract, TEMPLE),
    tvl: ethTvl,
  },
  methodology:
    "Counts stables from TEMPLE-FRAX AMM LP, Temple Defend and FRAX+3CRV LP as treasury TVL",
};
