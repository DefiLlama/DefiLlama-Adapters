const axios = require("axios")
const { default: BigNumber } = require("bignumber.js")
const { transformNearAddress } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')

const transformAddress = transformNearAddress()

const endpoint = "https://rpc.mainnet.near.org"

const tokenMapping = {
  'wrap.near': { name: 'near', decimals: 24, },
  'meta-pool.near': { name: 'staked-near', decimals: 24, },
  'usn': { name: 'usn', decimals: 18, },
  'aurora': { name: 'ethereum', decimals: 18, },
  'token.skyward.near': { name: 'skyward-finance', decimals: 18, },
  'dbio.near': { name: 'debio-network', decimals: 18, },
  // 'hak.tkn.near': { name: '', }, // Hakuna matata
  // 'meta-token.near': { name: '', }, // $Meta
  'v3.oin_finance.near': { name: 'oin-finance', decimals: 8, },
  // 'gems.l2e.near': { name: '', }, // https://www.landtoempire.com/
  // 'nd.tkn.near': { name: '', },   // nearDog
  // 'gold.l2e.near': { name: '', }, // https://www.landtoempire.com/
  'token.v2.ref-finance.near': { name: 'ref-finance', decimals: 18, },
  // 'myriadcore.near': { name: '', },  // Myria
  'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near': { name: 'usd-coin', decimals: 18 },
  'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near': { name: 'tether', decimals: 18 },
  '2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near': { name: 'wrapped-bitcoin', decimals: 18 }
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
      balance = BigNumber(balance).shiftedBy(-1 * decimals)

    if (!balances[name])
      balances[name] = BigNumber(0)

    balances[name] = balances[name].plus(balance)
    return
  }

  sdk.util.sumSingleBalance(balances, transformAddress(token), balance)
  return balances
}

module.exports = {
  view_account,
  call,
  addTokenBalances,
  getTokenBalance,
  sumSingleBalance,
};
