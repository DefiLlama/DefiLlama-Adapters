const { getConfig } = require('../helper/cache')
const http = require('../helper/http');
const { getTokenBalances } = require('../helper/chain/keeta');
const ADDRESSES = require('../helper/coreAssets.json');
const sdk = require('@defillama/sdk')

const SUPPORTED_TOKENS = [
  ADDRESSES.keeta.KTA,
  ADDRESSES.keeta.USDC,
  ADDRESSES.keeta.EURC,
]

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
  const pools = await getConfig('alpaca-dex/pools', undefined, { fetcher: fetchAllPools });

  await sdk.util.runInPromisePool({
    concurrency: 10,
    items: pools,
    processor: async (pool) => {
      const balances = await getTokenBalances(pool, api.timestamp, SUPPORTED_TOKENS);
      for (const [token, balance] of balances) {
        api.add(token, balance);
      }
    }
  })
}

module.exports = {
  methodology: 'TVL is calculated as the sum of all KTA, USDC, EURC tokens held in liquidity pool accounts.',
  // Date of Alpaca DEX release
  start: '2025-11-12',
  keeta: {
    tvl,
  }
}
