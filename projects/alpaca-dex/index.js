const plimit = require("p-limit");
const http = require('../helper/http');
const { getTokenBalances } = require('../helper/chain/keeta');
const ADDRESSES = require('../helper/coreAssets.json');

const SUPPORTED_TOKENS = [
  ADDRESSES.keeta.KTA,
  ADDRESSES.keeta.USDC,
  ADDRESSES.keeta.EURC,
]

const limit = plimit(10);

async function fetchAllPools() {
  const pools = [];

  let cursor = null;
  while (true) {
    let apiURL = `https://api.alpacadex.com/token-list?network=main&limit=100`;
    if (cursor !== null) {
      apiURL += `&cursor=${cursor}`;
    }

    const { tokens, nextCursor } = await http.get(apiURL);

    for (const token of tokens) {
      pools.push(token.address);
    }

    if (!nextCursor) {
      break;
    }

    cursor = nextCursor;
  }

  return pools;
}

async function tvl(api) {
  const pools = await fetchAllPools();

  const results = await Promise.all(
    pools.map(pool => limit(() => getTokenBalances(pool, api.timestamp, SUPPORTED_TOKENS))),
  );

  const aggregatedBalances = new Map();
  for (const result of results) {
    for (const [token, balance] of result) {
      if (!aggregatedBalances.has(token)) {
        aggregatedBalances.set(token, 0n);
      }

      aggregatedBalances.set(
        token,
        aggregatedBalances.get(token) + balance,
      );
    }
  }

  for (const [token, balance] of aggregatedBalances) {
    api.add(token, balance);
  }
}

module.exports = {
  methodology: 'TVL is calculated as the sum of all KTA, USDC, EURC tokens held in liquidity pool accounts.',
  // Date of Alpaca DEX release
  start: '2025-11-12',
  keeta: {
    tvl,
  }
}
