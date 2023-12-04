const { get } = require('../http')
const ADDRESSES = require('../coreAssets.json')
const { getUniqueAddresses } = require('../utils')

async function getTonBalance(addr) {
  const res = await get(`https://tonapi.io/v2/accounts/${addr}`)
  return res.balance
}

async function sumTokensAccount({ api, addr, tokens = [] }) {
  if (tokens.includes(ADDRESSES.null)) {
    const balance = await getTonBalance(addr)
    api.add(ADDRESSES.null, balance)
  }
  const { balances } = await get(`https://tonapi.io/v2/accounts/${addr}/jettons?currencies=usd`)
  balances.forEach(({ balance, price, jetton }) => {
    const decimals = jetton.decimals
    price = price?.prices?.USD
    if (!decimals || !price) return;
    const bal = balance * price / 10 ** decimals
    api.add('tether', bal, { skipChain: true })
  })
}

async function sumTokens({ api, tokens, owners = [], owner }) {
  if (!api) throw new Error('api is required')

  if (owner) owners.push(owner)
  owners = getUniqueAddresses(owners, api.chain)
  await Promise.all(owners.map(i => sumTokensAccount({ api, addr: i, tokens })))
  return api.getBalances()
}

async function sumTokensExport({ ...args }) {
  return (_, _1, _2, { api }) => sumTokens({ api, ...args })
}


module.exports = {
  getTonBalance,
  sumTokens,
  sumTokensExport,
}