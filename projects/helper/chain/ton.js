const { get, post, } = require('../http')
const ADDRESSES = require('../coreAssets.json')
const plimit = require('p-limit')
const _rateLimited = plimit(1)
const rateLimited = fn => (...args) => _rateLimited(() => fn(...args))

const { getUniqueAddresses, sleep } = require('../utils')

async function getTonBalance(addr) {
  const res = await get(`https://tonapi.io/v2/accounts/${addr}`)
  return res.balance
}

async function _sumTokensAccount({ api, addr, tokens = [], onlyWhitelistedTokens = false }) {
  if (tokens.includes(ADDRESSES.null)) {
    const balance = await getTonBalance(addr)
    api.add(ADDRESSES.null, balance)
  }
  const { balances } = await get(`https://tonapi.io/v2/accounts/${addr}/jettons?currencies=usd`)
  await sleep(1000 * (10 * Math.random() + 3))
  balances.forEach(({ balance, price, jetton }) => {
    if (onlyWhitelistedTokens && !tokens.includes(jetton.address)) return;
    const decimals = jetton.decimals
    price = price?.prices?.USD
    if (!decimals || !price) return;
    const bal = balance * price / 10 ** decimals
    api.add('tether', bal, { skipChain: true })
  })
}

const sumTokensAccount = rateLimited(_sumTokensAccount)

async function sumTokens({ api, tokens, owners = [], owner, onlyWhitelistedTokens = false }) {
  if (!api) throw new Error('api is required')

  if (owner) owners.push(owner)
  owners = getUniqueAddresses(owners, api.chain)
  for (const addr of owners) {
    await sumTokensAccount({ api, addr, tokens, onlyWhitelistedTokens })
  }
  return api.getBalances()
}

function sumTokensExport({ ...args }) {
  return (_, _1, _2, { api }) => sumTokens({ api, ...args })
}

async function call({ target, abi, params = [] }) {
  const requestBody = {
    "address": target,
    "method": abi,
    "stack": params
  }
  const { ok, result } = await post('https://toncenter.com/api/v2/runGetMethod', requestBody)
  if (!ok) {
    throw new Error("Unknown");
  }
  const { exit_code, stack } = result
  if (exit_code !== 0) {
    throw new Error('Expected a zero exit code, but got ' + exit_code)
  }
  stack.forEach((i, idx) => {
    if (i[0] === 'num') {
      stack[idx] = parseInt(i[1], 16)
    }
  })

  return stack
}

module.exports = {
  getTonBalance,
  sumTokens,
  sumTokensExport,
  call,
}