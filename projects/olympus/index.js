const sdk = require("@defillama/sdk");
const { toUSDTBalances } = require("../helper/balances");
const { blockQuery } = require("../helper/http");
const BigNumber = require("bignumber.js");

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
      category
      tokenAddress
      balance
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

//Subgraph returns balances in tokenAddress / allocator pairs. Need to return based on balance.
function sumBalancesByTokenAddress(arr) {
  return arr.reduce((acc, curr) => {
    const found = acc.find((item) => item.tokenAddress === curr.tokenAddress);
    if (found) {
      found.balance = +found.balance + +curr.balance;
    } else {
      const newItem = {
        tokenAddress: curr.tokenAddress,
        balance: curr.balance,
        category: curr.category,
      };
      acc.push(newItem);
    }
    return acc;
  }, []);
}

/*** Query Subgraphs for latest Treasury Allocations  ***
 * #1. Query tokenRecords for latestBlock indexed in subgraph.
 *     This allows us to filter protocol query to a list of results only for the latest block indexed
 * #2. Call tokenRecords with block num from prev query
 * #3. Sum values returned
 ***/
async function tvl(timestamp, block, _, { api }, poolsOnly = false) {
  const indexedBlockForEndpoint = await blockQuery(
    subgraphUrls[api.chain],
    getLatestBlockIndexed,
    { api }
  );
  const blockNum = indexedBlockForEndpoint.lastBlock[0].block;
  const { tokenRecords } = await blockQuery(
    subgraphUrls[api.chain],
    protocolQuery(blockNum),
    { api }
  );

  const aDay = 24 * 3600;
  const now = Date.now() / 1e3;
  if (now - blockNum[0].timestamp > 3 * aDay) {
    throw new Error("outdated");
  }
  const filteredTokenRecords = poolsOnly
    ? tokenRecords.filter((t) => t.category === "Protocol-Owned Liquidity")
    : tokenRecords;
  const tokensToBalances = sumBalancesByTokenAddress(filteredTokenRecords);
  const balances = await Promise.all(
    tokensToBalances.map(async (token, index) => {
      const decimals = await sdk.api.abi.call({
        abi: "erc20:decimals",
        target: token.tokenAddress,
        chain: api.chain,
      });
      return [
        `${api.chain}:${token.tokenAddress}`,
        Number(
          BigNumber(token.balance)
            .times(10 ** decimals.output)
            .toFixed(0)
        ),
      ];
    })
  );

  return Object.fromEntries(balances);
}

async function pool2(timestamp, block, _, { api }) {
  return tvl(timestamp, block, _, { api }, true);
}

module.exports = {
  start: 1616569200, // March 24th, 2021
  timetravel: false,
  misrepresentedTokens: true,
  ethereum: {
    tvl: tvl,
    staking,
    pool2,
  },
  arbitrum: {
    tvl: tvl,
    pool2,
  },
  polygon: {
    tvl: tvl,
    pool2,
  },
  fantom: {
    tvl: tvl,
    pool2,
  },
};
