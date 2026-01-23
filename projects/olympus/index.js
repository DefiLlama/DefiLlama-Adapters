// projects/olympus/index.js

const ADDRESSES = require('../helper/coreAssets.json')
const { blockQuery } = require("../helper/http");
const { staking } = require('../helper/staking');
const { sumTokens2 } = require("../helper/unwrapLPs");

const OlympusStakings = [
  "0x0822F3C03dcc24d200AFF33493Dc08d0e1f274A2", // Old Staking Contract
  "0xFd31c7d00Ca47653c6Ce64Af53c1571f9C36566a", // New Staking Contract
  "0xb63cac384247597756545b500253ff8e607a8020",
];

const OHM_V1 = "0x383518188c0c6d7730d91b2c03a03c837814a899"
const OHM = "0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5"
const GOHM = "0x0ab87046fBb341D058F17CBC4c1133F25a20a52f"

const olympusTokens = [GOHM, OHM];

// Updated subgraph IDs - removed dead chains (Fantom, Polygon), added Base
const subgraphUrls = {
  ethereum: "7jeChfyUTWRyp2JxPGuuzxvGt3fDKMkC9rLjm7sfLcNp",
  arbitrum: "8Zxb1kVv9ZBChHXEPSgtC5u5gjCijMn5k8ErpzRYWNgH",
  base: "3YAC1Gj2AUFCQ8wd4DaBQmqU3DJZjKyr45dQykAtXuMU",
};

/** Map staked assets without price feeds to those with price feeds (1:1) */
const addressMap = {
  "0xb23dfc0c4502a271976f1ee65321c51be2529640": "0x76fcf0e8c7ff37a47a799fa2cd4c13cde0d981c9", // aura50OHM-50DAI -> 50OHM-50DAI
  "0xc8418af6358ffdda74e09ca9cc3fe03ca6adc5b0": ADDRESSES.ethereum.FXS, // veFXS -> FXS
  "0x3fa73f1e5d8a792c80f426fc8f84fbf7ce9bbcac": "0xc0c293ce456ff0ed870add98a0828dd4d2903dbf", // vlAURA -> AURA
  [ADDRESSES.ethereum.vlCVX]: ADDRESSES.ethereum.CVX, // vlCVX -> CVX
  "0xa02d8861fbfd0ba3d8ebafa447fe7680a3fa9a93": "0xd1ec5e215e8148d76f4460e4097fd3d5ae0a3558", // aura50OHM-50WETH -> 50OHM-50WETH
  "0x0ef97ef0e20f84e82ec2d79cbd9eda923c3daf09": "0xd4f79ca0ac83192693bce4699d0c10c66aa6cf0f", // auraOHM-wstETH -> OHM-wstETH
  "0x81b0dcda53482a2ea9eb496342dc787643323e95": "0x5271045f7b73c17825a7a7aee6917ee46b0b7520", // stkcvxOHMFRAXBP-f-frax -> OHMFRAXBP-f
  "0x8a53ee42fb458d4897e15cc7dea3f75d0f1c3475": "0x3175df0976dfa876431c2e9ee6bc45b65d3473cc", // stkcvxcrvFRAX-frax -> crvFRAX-frax
  "0xb0c22d8d350c67420f06f48936654f567c73e8c8": "0x4e78011ce80ee02d2c3e649fb657e45898257815", // sKLIMA -> KLIMA
  "0x742b70151cd3bc7ab598aaff1d54b90c3ebc6027": "0xc55126051B22eBb829D00368f4B12Bde432de5Da", // rlBTRFLY -> BTRFLY V2
  "0xc0d4ceb216b3ba9c3701b291766fdcba977cec3a": "0xc55126051B22eBb829D00368f4B12Bde432de5Da", // BTRFLY -> BTRFLY V2
};

const poolsWithoutDecimals = ["0x88051b0eea095007d3bef21ab287be961f3d8598"];

const getLatestBlockIndexed = `
query {
  lastBlock: tokenRecords(first: 1, orderBy: block, orderDirection: desc) {
    block
    timestamp
  }
}`;

const protocolQuery = (block) => `
  query {
    tokenRecords(orderDirection: desc, orderBy: block, where: {block: ${block}}) {
      block
      timestamp
      category
      tokenAddress
      token
      balance
    }
  }
`;

function sumBalancesByTokenAddress(arr) {
  return arr.reduce((acc, curr) => {
    const found = acc.find((item) => item.tokenAddress === curr.tokenAddress);
    if (found) {
      found.balance = +found.balance + +curr.balance;
    } else {
      acc.push({
        tokenAddress: curr.tokenAddress,
        balance: curr.balance,
        category: curr.category,
        token: curr.token,
      });
    }
    return acc;
  }, []);
}

/**
 * Build TVL function for different modes:
 * - 'tvl': Treasury assets excluding OHM/gOHM and borrowed assets
 * - 'ownTokens': Protocol-owned OHM/gOHM
 * - 'borrowed': DAI lent out through Cooler Loans
 */
function buildTvl(mode = 'tvl') {
  return async function(api) {
    if (!subgraphUrls[api.chain]) return {};

    const indexedBlockForEndpoint = await blockQuery(subgraphUrls[api.chain], getLatestBlockIndexed, { api });
    const latest = indexedBlockForEndpoint?.lastBlock?.[0];
    if (!latest) throw new Error('no-indexed-block');

    const blockNum = latest.block;
    const lastTs = Number(latest.timestamp);

    // Staleness guard (3 days)
    const aDay = 24 * 3600;
    const now = Date.now() / 1e3;
    if (!Number.isFinite(lastTs) || now - lastTs > 3 * aDay) {
      throw new Error("outdated");
    }

    const trResp = await blockQuery(subgraphUrls[api.chain], protocolQuery(blockNum), { api });
    const tokenRecords = trResp?.tokenRecords || [];

    // Filter out problematic pools
    const filteredTokenRecords = tokenRecords.filter(
      (t) => !poolsWithoutDecimals.includes(t.tokenAddress)
    );

    // Normalize addresses for pricing
    const normalizedRecords = filteredTokenRecords.map((token) => ({
      ...token,
      tokenAddress: addressMap[token.tokenAddress] || token.tokenAddress,
    }));

    const ownTokens = new Set(olympusTokens.map(i => i.toLowerCase()));

    // Filter based on mode
    let recordsToProcess;
    if (mode === 'borrowed') {
      // Cooler Loans: filter for "Borrowed Through Cooler Loans" tokens
      recordsToProcess = normalizedRecords.filter(t =>
        t.token?.includes('Borrowed Through Cooler Loans')
      );
    } else {
      // Exclude borrowed records from TVL/ownTokens
      recordsToProcess = normalizedRecords.filter(t =>
        !t.token?.includes('Borrowed Through Cooler Loans')
      );
    }

    // Exclude specific arbitrum pool IDs that break pricing/decimals
    if (api.chain === 'arbitrum') {
      recordsToProcess = recordsToProcess.filter(i => ![
        '0x89dc7e71e362faf88d92288fe2311d25c6a1b5e0000200000000000000000423',
        '0xce6195089b302633ed60f3f427d1380f6a2bfbc7000200000000000000000424',
      ].includes(i.tokenAddress));
    }

    const tokensToBalances = sumBalancesByTokenAddress(recordsToProcess);
    const tokens = tokensToBalances.map(i => i.tokenAddress);
    const decimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens, permitFailure: true });

    tokensToBalances.forEach((token, i) => {
      if (!decimals[i]) return;
      const isOwn = ownTokens.has(token.tokenAddress.toLowerCase());

      if (mode === 'ownTokens' && !isOwn) return;
      if (mode === 'tvl' && isOwn) return;
      // borrowed mode: include all borrowed tokens

      api.add(token.tokenAddress, Math.abs(token.balance) * 10 ** decimals[i]);
    });

    return mode === 'borrowed' ? api.getBalances() : await sumTokens2({ api, resolveLP: true });
  };
}

module.exports = {
  start: '2021-03-24',
  timetravel: false,
  hallmarks: [
    [1616544000, "Olympus Launch"],
    [1634601600, "OHM v2 Migration begins"],
    [1642723200, "Inverse Bonds"],
    [1651276800, "Fei Protocol Hack"],
    [1668643200, "Range-Bound Stability Launch"],
    [1690070400, "Cooler Loans Launch"],
    [1726790400, "Yield Repurchase Facility"],
    [1727740800, "On-Chain Governance"],
    [1732060800, "Emissions Manager Launch"],
    [1736899200, "Cooler v2 Launch"],
    [1764547200, "Convertible Deposits Launch"],
    [1767830400, "CD Lending and Limit Orders"],
  ],
  methodology: "Treasury value from subgraph excluding protocol-owned OHM. Borrowed shows DAI/USDS lent through Cooler Loans.",
  ethereum: {
    staking: staking(OlympusStakings, [OHM, OHM_V1]),
    tvl: buildTvl('tvl'),
    ownTokens: buildTvl('ownTokens'),
    borrowed: buildTvl('borrowed'),
  },
  arbitrum: {
    tvl: buildTvl('tvl'),
    ownTokens: buildTvl('ownTokens'),
  },
  base: {
    tvl: buildTvl('tvl'),
    ownTokens: buildTvl('ownTokens'),
  },
};
