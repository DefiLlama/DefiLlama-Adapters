const ADDRESSES = require('../coreAssets.json')
const axios = require("axios")
const { default: BigNumber } = require("bignumber.js")
const sdk = require('@defillama/sdk')

function transformAddress(addr) {
  const bridgedAssetIdentifier = ".factory.bridge.near";
  if (addr.endsWith(bridgedAssetIdentifier))
    return `0x${addr.slice(0, addr.length - bridgedAssetIdentifier.length)}`;
  if (addr.endsWith('.near'))
    return `near:${addr}`
  return addr
}

const endpoints = [
  "https://rpc.mainnet.near.org",
  "https://near.lava.build"
]

const tokenMapping = {
  'wrap.near': { name: 'near', decimals: 24, },
  'meta-pool.near': { name: 'staked-near', decimals: 24, },
  [ADDRESSES.near.LINA]: { name: 'linear-protocol', decimals: 24, },
  "storage.herewallet.near": { name: 'here-staking', decimals: 24, },
  'usn': { name: 'usn', decimals: 18, },
  'aurora': { name: 'ethereum', decimals: 18, },
  'token.skyward.near': { name: 'skyward-finance', decimals: 18, },
  'dbio.near': { name: 'debio-network', decimals: 18, },
  // 'hak.tkn.near': { name: '', }, // Hakuna matata
  'meta-token.near': { name: 'meta-near', decimals: 24 },
  'v3.oin_finance.near': { name: 'oin-finance', decimals: 8, },
  'usdt.tether-token.near': { name: 'tether', decimals: 6, },
  'eth-0xdac17f958d2ee523a2206206994597c13d831ec7.omft.near': { name: 'tether', decimals: 6 },
  'eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near': { name: 'usd-coin', decimals: 6 },
  // 'gems.l2e.near': { name: '', }, // https://www.landtoempire.com/
  // 'nd.tkn.near': { name: '', },   // nearDog
  // 'gold.l2e.near': { name: '', }, // https://www.landtoempire.com/
  'token.v2.ref-finance.near': { name: 'ref-finance', decimals: 18, },
  // 'myriadcore.near': { name: '', },  // Myria
  // '6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near': { name: 'dai', decimals: 18 },
  // 'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near': { name: 'usd-coin', decimals: 6 },
  // 'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near': { name: 'tether', decimals: 6 },
  // '2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near': { name: ADDRESSES.ethereum.WBTC, decimals: 0 },
  // 'aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near': { name: 'aurora-near', decimals: 18 },
  [ADDRESSES.near.BURROW]: { name: 'burrow', decimals: 18 },
  [ADDRESSES.near.PARAS]: { name: 'paras', decimals: 18 },
  [ADDRESSES.near.PEMBROCK]: { name: 'pembrock', decimals: 18 },
  'token.sweat': { name: 'sweatcoin', decimals: 18 },
  'v2-nearx.stader-labs.near': { name: 'stader-nearx', decimals: 24 },
  '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1': { name: 'usd-coin', decimals: 6 },
  'edge-fast.near': { name: 'edge-video-ai', decimals: 24 },
  '802d89b6e511b335f05024a65161bce7efc3f311.factory.bridge.near': { name: 'linear-protocol-lnr', decimals: 18 },
  'ftv2.nekotoken.near': { name: 'neko', decimals: 24 },
  'token.lonkingnearbackto2024.near': { name: 'lonk-on-near', decimals: 8 },
  'blackdragon.tkn.near': { name: 'black-dragon', decimals: 24 },
  'gear.enleap.near': { name: 'near-tinker-union-gear', decimals: 18 },
  'token.0xshitzu.near': { name: 'shitzu', decimals: 18 },
  'purge-558.meme-cooking.near': { name: 'forgive-me-father', decimals: 18 },
  'mpdao-token.near': { name: 'meta-pool-dao', decimals: 6 },
  'kat.token0.near': { name: 'nearkat', decimals: 18 },
  'btc.omft.near': { name: 'bitcoin', decimals: 8 },
  'eth-0x2260fac5e5542a773aa44fbcfedf7c193bc2c599.omft.near': { name: 'wrapped-btc', decimals: 8 },
  'cardano.omft.near': { name: 'cardano', decimals: 6 },
  'doge.omft.near': { name: 'dogecoin', decimals: 8 },
  'ltc.omft.near': { name: 'litecoin', decimals: 8 },
  'xrp.omft.near': { name: 'ripple', decimals: 6 },
}

// Tokens whose own price feed is too sparse to depend on. LiNEAR is quoted on only
// 12 of the last 20 days, and on a day with no quote the entire balance silently
// disappears from TVL instead of erroring, so the published series flaps. Each entry
// is converted to a base asset at the issuing contract's own on-chain exchange rate,
// and the base asset is quoted every day.
//
// Keyed by the balance key sumSingleBalance produces (the tokenMapping name), so the
// conversion works whether the balance arrived through sumTokens/addTokenBalances or
// through a direct sumSingleBalance call.
const thinFeedTokens = {
  'linear-protocol': {
    contract: ADDRESSES.near.LINA,
    base: 'coingecko:near',
    method: 'ft_price',      // value of 1 LiNEAR in yoctoNEAR
    rateDecimals: 24,
  },
}

const rateCache = {}

async function getConversionRate({ contract, method, rateDecimals }) {
  // A rejected lookup must not be cached, or the first failure blocks every retry
  // for the life of the process.
  if (!rateCache[contract])
    rateCache[contract] = call(contract, method, {})
      .then(i => Number(i) / 10 ** rateDecimals)
      .catch(e => { delete rateCache[contract]; throw e })
  return rateCache[contract]
}

// Re-denominate any thin-feed token already accumulated in `balances`. Idempotent:
// the key is removed once converted, so calling it twice is a no-op.
async function convertThinFeeds(balances = {}) {
  for (const [key, config] of Object.entries(thinFeedTokens)) {
    const amount = balances[key]
    if (!amount) continue
    // Claim the balance before the first await. sumTokens aggregates several owners
    // concurrently into one balances object, so reading the amount and only deleting
    // the key after awaiting the rate would let two callers convert the same balance
    // and book it twice.
    delete balances[key]
    const rate = await getConversionRate(config)
    sdk.util.sumSingleBalance(balances, config.base, Number(amount) * rate)
  }
  return balances
}

function shouldRetry(error) {
  if (!error.response) return true;
  const retriable = [400, 429, 500, 504];
  return retriable.includes(error.response.status);
}

async function rpcRequest(payload) {
  let lastError;

  for (const url of endpoints) {
    try {
      return await axios.post(url, payload, { validateStatus: status => status < 400 });
    } catch (err) {
      if (!shouldRetry(err)) throw err;
      lastError = err;
    }
  }
  throw lastError;
}

async function view_account(account_id) {
  const payload = {
    jsonrpc: "2.0",
    id: "1",
    method: "query",
    params: {
      request_type: "view_account",
      finality: "final",
      account_id
    }
  };

  const result = await rpcRequest(payload);
  if (result.data.error) throw new Error(`${result.data.error.message}: ${result.data.error.data}`);
  return result.data.result;
}

async function call(contract, method, args = {}) {
  const payload = {
    jsonrpc: "2.0",
    id: "1",
    method: "query",
    params: {
      request_type: "call_function",
      finality: "final",
      account_id: contract,
      method_name: method,
      args_base64: Buffer.from(JSON.stringify(args)).toString("base64")
    }
  };

  const result = await rpcRequest(payload);
  if (result.data.error) throw new Error(`${result.data.error.message}: ${result.data.error.data}`);
  return JSON.parse(Buffer.from(result.data.result.result).toString());
}

async function getTokenBalance(token, account) {
  try {
    const response = await call(token, "ft_balance_of", { account_id: account })
    return response
  } catch (e) {
    if (e.message.includes("does not exist while viewing")) {
      return 0;
    }
    throw e;
  }
}

async function addTokenBalances(tokens, account, balances = {}) {
  if (!Array.isArray(tokens)) tokens = [tokens]
  await sdk.util.runInPromisePool({
    concurrency: 3,
    items: tokens,
    processor: token => addAsset(token, account, balances),
  })
  return convertThinFeeds(balances)
}

async function addAsset(token, account, balances = {}) {
  let balance = await getTokenBalance(token, account)
  return sumSingleBalance(balances, token, balance)
}

function sumSingleBalance(balances, token, balance) {
  const { name, decimals, } = tokenMapping[token] || {}

  if (name) {
    if (decimals)
      balance = balance / (10 ** decimals)

    balances[name] = +(balances[name] || 0) + balance
    return
  }

  sdk.util.sumSingleBalance(balances, transformAddress(token), BigNumber(balance).toFixed(0))
  return balances
}

async function sumTokens({ balances = {}, owners = [], tokens = []}) {
  tokens = tokens.filter(i => i !== 'aurora')
  await sdk.util.runInPromisePool({
    concurrency: 3,
    items: owners,
    processor: i => addTokenBalances(tokens, i, balances),
  })
  const bals = []
  await sdk.util.runInPromisePool({
    concurrency: 3,
    items: owners,
    processor: async i => bals.push(await view_account(i)),
  })
  const nearBalance = bals.reduce((a,i) => a + (i.amount/1e24), 0)
  sdk.util.sumSingleBalance(balances,'coingecko:near',nearBalance)
  return convertThinFeeds(balances)
}

module.exports = {
  view_account,
  convertThinFeeds,
  call,
  addTokenBalances,
  getTokenBalance,
  sumSingleBalance,
  sumTokens,
};
