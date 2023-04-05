const sdk = require("@defillama/sdk");
const { toUSDTBalances } = require("../helper/balances");
const { blockQuery } = require("../helper/http");

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
      abi: "erc20:balanceOf",
      target: OHM,
      params: stakings,
      block: ethBlock,
    });

    sdk.util.sumSingleBalance(balances, OHM, stakingBalance.output);
  }

  return balances;
};

const protocolQuery = (block) => `
  query {
    tokenRecords(orderDirection: desc, orderBy: block, where: {block: ${block}}) {
      block
      timestamp
      value
      category
      source
      id
      tokenAddress
    }
  }
`;

const getLatestBlockIndexed = `
query {
  lastBlock: tokenRecords(first: 1, orderBy: block, orderDirection: desc) {
    block
    timestamp
  }
}`;

/*** Query Subgraphs for latest Treasury Allocations  ***
 * #1. Query tokenRecords for latestBlock indexed in subgraph. 
 *     This allows us to filter protocol query to a list of results only for the latest block indexed
 * #2. Call tokenRecords with block num from prev query
 * #3. Sum values returned
 ***/
async function tvl(timestamp, block, _, { api }) {
  const subgraphUrls = {
    ethereum:
      "https://api.thegraph.com/subgraphs/name/olympusdao/olympus-protocol-metrics",
    arbitrum:
      "https://api.thegraph.com/subgraphs/name/olympusdao/protocol-metrics-arbitrum",
    fantom:
      "https://api.thegraph.com/subgraphs/name/olympusdao/protocol-metrics-fantom",
    polygon:
      "https://api.thegraph.com/subgraphs/name/olympusdao/protocol-metrics-polygon",
  };

  const indexedBlockForEndpoint = await blockQuery(
    subgraphUrls[api.chain],
    getLatestBlockIndexed,
    { api }
  );
  const blockNum = indexedBlockForEndpoint.lastBlock[0].block;
  const { tokenRecords } = await blockQuery(
    subgraphUrls[api.chain],
    protocolQuery(blockNum),
    {
      api,
    }
  );

  const metric = tokenRecords.reduce((acc, cur) => {
    return acc + parseFloat(cur.value);
  }, 0);

  const aDay = 24 * 3600;
  const now = Date.now() / 1e3;
  if (now - blockNum[0].timestamp > 3 * aDay) {
    throw new Error("outdated");
  }

  return toUSDTBalances(metric);
}

module.exports = {
  start: 1616569200, // March 24th, 2021
  timetravel: false,
  misrepresentedTokens: true,
  ethereum: {
    tvl: tvl,
    staking,
  },
  arbitrum: {
    tvl: tvl,
  },
  polygon: {
    tvl: tvl,
  },
  fantom: {
    tvl: tvl,
  },
};
