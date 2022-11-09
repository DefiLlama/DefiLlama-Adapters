const sdk = require("@defillama/sdk");
const {gql, request} = require('graphql-request');
const { toUSDTBalances } = require("../helper/balances");

const OlympusStakings = [
  // Old Staking Contract
  "0x0822F3C03dcc24d200AFF33493Dc08d0e1f274A2",
  // New Staking Contract
  "0xFd31c7d00Ca47653c6Ce64Af53c1571f9C36566a",
];

const OHM = "0x383518188c0c6d7730d91b2c03a03c837814a899";


/*** Staking of native token (OHM) TVL Portion ***/
const staking = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  for (const stakings of OlympusStakings) {
    const stakingBalance = await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      target: OHM,
      params: stakings,
      block: ethBlock,
    });

    sdk.util.sumSingleBalance(balances, OHM, stakingBalance.output);
  }

  return balances;
};

const protocolQuery = gql`
query get_tvl($block: Int) {
  protocolMetrics(
    first: 1, orderBy: timestamp, orderDirection: desc
  ) {
    treasuryMarketValue
    timestamp
  }
}
`

/*** Bonds TVL Portion (Treasury) ***
 * Treasury TVL consists of DAI, FRAX and WETH balances + Sushi SLP and UNI-V2 balances
 ***/
async function ethTvl(timestamp, block) {
  const queriedData = await request("https://api.thegraph.com/subgraphs/name/drondin/olympus-protocol-metrics", protocolQuery, {block})
  const metric= queriedData.protocolMetrics[0]
  if(Date.now()/1000 - metric.timestamp > 3600*24){
    throw new Error("outdated")
  }
  return toUSDTBalances(metric.treasuryMarketValue)
}

module.exports = {
  start: 1616569200, // March 24th, 2021
  timetravel: false,
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
    staking
  },
  methodology:
    "Counts DAI, DAI SLP (OHM-DAI), FRAX, FRAX ULP (OHM-FRAX), WETH on the treasury",
};
