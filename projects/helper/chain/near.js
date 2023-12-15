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

const endpoint = "https://rpc.mainnet.near.org"

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
}

async function view_account(account_id) {
  const result = await axios.post(endpoint, {
    "jsonrpc": "2.0",
    "id": "1",
    "method": "query",
    "params": {
      "request_type": "view_account",
      "finality": "final",
      "account_id": account_id
    }
  });
  if (result.data.error) {
    throw new Error(`${result.data.error.message}: ${result.data.error.data}`)
  }
  return result.data.result;
}

async function call(contract, method, args = {}) {
  const result = await axios.post(endpoint, {
    "jsonrpc": "2.0",
    "id": "1",
    "method": "query",
    "params": {
      "request_type": "call_function",
      "finality": "final",
      "account_id": contract,
      "method_name": method,
      "args_base64": Buffer.from(JSON.stringify(args)).toString("base64")
    }
  });
  if (result.data.error) {
    throw new Error(`${result.data.error.message}: ${result.data.error.data}`)
  }
  return JSON.parse(Buffer.from(result.data.result.result).toString())
}

async function getTokenBalance(token, account) {
  return call(token, "ft_balance_of", { account_id: account })
}

async function addTokenBalances(tokens, account, balances = {}) {
  if (!Array.isArray(tokens)) tokens = [tokens]
  const fetchBalances = tokens.map(token => addAsset(token, account, balances))
  await Promise.all(fetchBalances)
  return balances
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
  await Promise.all(owners.map(i => addTokenBalances(tokens, i, balances)))
  const bals = await Promise.all(owners.map(view_account))
  const nearBalance = bals.reduce((a,i) => a + (i.amount/1e24), 0)
  sdk.util.sumSingleBalance(balances,'coingecko:near',nearBalance)
  return balances
}

module.exports = {
  view_account,
  call,
  addTokenBalances,
  getTokenBalance,
  sumSingleBalance,
  sumTokens,
};
