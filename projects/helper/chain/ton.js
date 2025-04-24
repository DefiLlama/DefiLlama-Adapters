const { get, post, } = require('../http')
const ADDRESSES = require('../coreAssets.json')
const plimit = require('p-limit')
const _rateLimited = plimit(1)
const rateLimited = fn => (...args) => _rateLimited(() => fn(...args))
const { sumTokens2 } = require('../unwrapLPs')
const tonUtils = require('../utils/ton')

const { getUniqueAddresses, sleep, sliceIntoChunks } = require('../utils')

async function getTonBalance(addr) {
  const res = await get(`https://toncenter.com/api/v3/account?address=${addr}`)
  return res.balance
}

async function getJettonBalances(addr) {
  const response = await get(`https://tonapi.io/v2/accounts/${addr}/jettons?currencies=usd`)

  const res = {}
  response.balances.forEach(val => {
    res[val.jetton.address] = { balance: val.balance, price: val.price.prices.USD, decimals: val.jetton.decimals }
  })

  return res
}

async function _sumTokensAccount({ api, addr, tokens = [], onlyWhitelistedTokens = false, useTonApiForPrices = true, }) {
  if (onlyWhitelistedTokens && tokens.length === 1 && tokens.includes(ADDRESSES.ton.TON)) return;
  const { balances } = await get(`https://tonapi.io/v2/accounts/${addr}/jettons?currencies=usd`)
  await sleep(1000 * (3 * Math.random() + 3))
  tokens = tokens.map((a) => {
    if (a === ADDRESSES.ton.TON) return ADDRESSES.ton.TON
    return tonUtils.address(a).toString()
  })
  balances.forEach(({ balance, price, jetton }) => {
    const address = tonUtils.address(jetton.address).toString()
    if (onlyWhitelistedTokens && !tokens.includes(address)) return;
    if (!useTonApiForPrices) {
      api.add(address, balance)
      return;
    }
    const decimals = jetton.decimals
    price = price?.prices?.USD
    if (!decimals || !price) {
      api.add(address, balance)
      return;
    }
    const bal = balance * price / 10 ** decimals
    api.add('tether', bal, { skipChain: true })
  })
}

async function getTokenRates({ tokens = [] }) {
  const { rates } = await get(`https://tonapi.io/v2/rates?` + (
    new URLSearchParams({ tokens: tokens.join(','), currencies: "usd" })
  ).toString());

  const tokenPrices = {};

  tokens.forEach(tokenAddress => {
    if (rates[tokenAddress]) {
      const usdPrice = rates[tokenAddress].prices.USD;
      tokenPrices[tokenAddress] = usdPrice;
    }
  });

  return tokenPrices
}

const sumTokensAccount = rateLimited(_sumTokensAccount)

async function sumTokens({ api, tokens, owners = [], owner, onlyWhitelistedTokens = false, useTonApiForPrices = true }) {
  if (!api) throw new Error('api is required')

  if (owner) owners.push(owner)
  owners = getUniqueAddresses(owners, api.chain)

  if (tokens.includes(ADDRESSES.null)) await addTonBalances({ api, addresses: owners })
  if (onlyWhitelistedTokens && tokens.length === 1 && tokens.includes(ADDRESSES.ton.TON)) return sumTokens2({ api, })

  for (const addr of owners) {
    await sleep(1000 * (3 * Math.random() + 7))
    await sumTokensAccount({ api, addr, tokens, onlyWhitelistedTokens, useTonApiForPrices })
  }
  return sumTokens2({ api, })
}

function sumTokensExport({ ...args }) {
  return (api) => sumTokens({ api, ...args })
}

async function call({ target, abi, params = [], rawStack = false, }) {
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

  if (rawStack) return stack

  stack.forEach((i, idx) => {
    if (i[0] === 'num') {
      stack[idx] = parseInt(i[1], 16)
    }
  })

  return stack
}

async function addTonBalances({ api, addresses }) {
  api.log('Fetching TON balances', { addresses: addresses.length })
  const chunks = sliceIntoChunks(addresses, 399)
  let i = 0
  for (const chunk of chunks) {
    api.log('Fetching TON balances', { chunk: i++, chunks: chunks.length })
    const { accounts } = await get('https://toncenter.com/api/v3/accountStates?address=' + encodeURIComponent(chunk.join(',')) + '&include_boc=false')
    accounts.forEach(({ balance }) => {
      api.add(ADDRESSES.null, balance)
    })
    if (addresses.length > 199) {
      await sleep(3000)
    }
  }
}

module.exports = {
  addTonBalances,
  getTonBalance,
  getTokenRates,
  sumTokens,
  sumTokensExport,
  call,
  getJettonBalances,
}