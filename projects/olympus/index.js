const ADDRESSES = require('../helper/coreAssets.json')
const { blockQuery } = require("../helper/http");
const { getEnv } = require("../helper/env");
const { staking } = require('../helper/staking');
const { sumTokens2 } = require("../helper/unwrapLPs");

const OlympusStakings = [
  // Old Staking Contract
  "0x0822F3C03dcc24d200AFF33493Dc08d0e1f274A2",
  // New Staking Contract
  "0xFd31c7d00Ca47653c6Ce64Af53c1571f9C36566a",
  "0xb63cac384247597756545b500253ff8e607a8020",
];

const OHM_V1 = "0x383518188c0c6d7730d91b2c03a03c837814a899" // this is OHM v1
const OHM = "0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5" // this is OHM v1

/** Map any staked assets without price feeds to those with price feeds.
 * All balances are 1: 1 to their unstaked counterpart that has the price feed.
 **/
const addressMap = {
  "0xb23dfc0c4502a271976f1ee65321c51be2529640":
    "0x76fcf0e8c7ff37a47a799fa2cd4c13cde0d981c9", //aura50OHM-50DAI -> 50OHM-50DAI
  "0xc8418af6358ffdda74e09ca9cc3fe03ca6adc5b0":
    "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0", // veFXS -> FXS
  "0x3fa73f1e5d8a792c80f426fc8f84fbf7ce9bbcac":
    "0xc0c293ce456ff0ed870add98a0828dd4d2903dbf", //vlAURA -> AURA
  [ADDRESSES.ethereum.vlCVX]:
    ADDRESSES.ethereum.CVX, //vlCVX -> CVX
  "0xa02d8861fbfd0ba3d8ebafa447fe7680a3fa9a93":
    "0xd1ec5e215e8148d76f4460e4097fd3d5ae0a3558", //aura50OHM-50WETH -> 50OHM-50WETH
  "0x0ef97ef0e20f84e82ec2d79cbd9eda923c3daf09":
    "0xd4f79ca0ac83192693bce4699d0c10c66aa6cf0f", //auraOHM-wstETH -> OHM-wstETH
  "0x81b0dcda53482a2ea9eb496342dc787643323e95":
    "0x5271045f7b73c17825a7a7aee6917ee46b0b7520", //stkcvxOHMFRAXBP-f-frax -> OHMFRAXBP-f
  "0x8a53ee42fb458d4897e15cc7dea3f75d0f1c3475":
    "0x3175df0976dfa876431c2e9ee6bc45b65d3473cc", //stkcvxcrvFRAX-frax -> crvFRAX-frax
  "0xb0c22d8d350c67420f06f48936654f567c73e8c8":
    "0x4e78011ce80ee02d2c3e649fb657e45898257815", //sKLIMA -> KLIMA
  "0x742b70151cd3bc7ab598aaff1d54b90c3ebc6027":
    "0xc55126051B22eBb829D00368f4B12Bde432de5Da", //rlBTRFLY -> BTRFLY V2
  "0xc0d4ceb216b3ba9c3701b291766fdcba977cec3a":
    "0xc55126051B22eBb829D00368f4B12Bde432de5Da", //BTRFLY -> BTRFLYV2
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
async function tvl(api, isOwnTokensMode = false) {
const subgraphUrls = {
  ethereum: `https://gateway-arbitrum.network.thegraph.com/api/${getEnv("OLYMPUS_GRAPH_API_KEY")}/subgraphs/id/7jeChfyUTWRyp2JxPGuuzxvGt3fDKMkC9rLjm7sfLcNp`,
  arbitrum:
    "https://api.thegraph.com/subgraphs/name/olympusdao/protocol-metrics-arbitrum",
  fantom:
    "https://api.thegraph.com/subgraphs/name/olympusdao/protocol-metrics-fantom",
  polygon:
    "https://api.thegraph.com/subgraphs/name/olympusdao/protocol-metrics-polygon",
};
  
  //filter out problematic pools that dont have a decimals function.
  const poolsWithoutDecimals = ["0x88051b0eea095007d3bef21ab287be961f3d8598"];
  
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

  const filteredTokenRecords = tokenRecords.filter(
    (t) => !poolsWithoutDecimals.includes(t.tokenAddress)
  );

  const aDay = 24 * 3600;
  const now = Date.now() / 1e3;
  if (now - blockNum[0].timestamp > 3 * aDay) {
    throw new Error("outdated");
  }
  // const filteredTokenRecords = poolsOnly
  //   ? tokenRecords.filter((t) => t.category === "Protocol-Owned Liquidity")
  //   : tokenRecords;

  /**
   * iterates over filtered list from subgraph and returns any addresses
   * that need to be normalized for pricing .
   * See addressMap above
   **/
  const normalizedFilteredTokenRecords = filteredTokenRecords.map((token) => {
    const normalizedAddress = addressMap[token.tokenAddress]
      ? addressMap[token.tokenAddress]
      : token.tokenAddress;
    return { ...token, tokenAddress: normalizedAddress };
  });

  const tokensToBalances = sumBalancesByTokenAddress(
    normalizedFilteredTokenRecords
  ).filter(i => {
    if (api.chain !== 'arbitrum') return true;
    return !['0x89dc7e71e362faf88d92288fe2311d25c6a1b5e0000200000000000000000423', '0xce6195089b302633ed60f3f427d1380f6a2bfbc7000200000000000000000424'].includes(i.tokenAddress)
  })
  const tokens = tokensToBalances.map(i => i.tokenAddress)


  const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens })
  const ownTokens = new Set([
    '0x0ab87046fBb341D058F17CBC4c1133F25a20a52f', // GOHM
    '0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5', // OHM
  ].map(i => i.toLowerCase()))
  tokensToBalances.map(async (token, i) => {
    if (ownTokens.has(token.tokenAddress.toLowerCase())) {
      if (!isOwnTokensMode) return;
    } else if (isOwnTokensMode) return;
    api.add(token.tokenAddress, token.balance * 10 ** decimals[i])
  })
  return sumTokens2({ api, resolveLP: true, })
}

async function ownTokens(api) {
  return tvl(api, true);
}

module.exports = {
  start: 1616569200, // March 24th, 2021
  timetravel: false,
  methodology:
    "TVL is the sum of the value of all assets held by the treasury (excluding pTokens). Please visit https://app.olympusdao.finance/#/dashboard for more info.",
  ethereum: {
    staking: staking(OlympusStakings, [OHM, OHM_V1]),
    tvl,
    ownTokens,
  },
  arbitrum: {
    tvl,
    // pool2,
  },
  polygon: {
    tvl,
    // pool2,
  },
  fantom: {
    tvl,
    // pool2,
  },
};
