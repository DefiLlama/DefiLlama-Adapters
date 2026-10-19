const { get } = require('../helper/http')
const { getFixBalances } = require('../helper/portedTokens')
const BigNumber = require('bignumber.js')
const { PromisePool } = require('@supercharge/promise-pool')

const RPC = 'https://rpc.gno.land'
const API = 'https://api.gnoswap.io/v1'
const POOL = 'gno.land/r/gnoswap/pool'
const GOV_STAKER = 'gno.land/r/gnoswap/gov/staker'
const GNS = 'gno.land/r/gnoswap/gns.GNS'

async function query(expression, pkgPath = POOL) {
  const url = new URL(`${RPC}/abci_query`)
  url.searchParams.set('path', JSON.stringify('vm/qeval_json'))
  url.searchParams.set('data', `0x${Buffer.from(`${pkgPath}.${expression}`).toString('hex')}`)
  const { result, error } = await get(url.toString())
  const response = result?.response?.ResponseBase
  if (error || !response || response.Error || !response.Data)
    throw new Error(`Gno query failed: ${expression}: ${JSON.stringify(error || response)}`)
  const { results } = JSON.parse(Buffer.from(response.Data, 'base64').toString())
  if (!Array.isArray(results)) throw new Error(`Missing Gno query results: ${expression}`)
  return results
}

function integer(value) {
  if (value?.T?.['@type'] !== '/gno.PrimitiveType' || !['32', '1024'].includes(value.T.value))
    throw new Error('Expected a Gno int or int64')
  const bytes = Buffer.from(value.N || '', 'base64')
  if (bytes.length !== 8) throw new Error('Invalid Gno integer encoding')
  return bytes.readBigInt64LE().toString()
}

async function tvl(api) {
  const [countResult, { data: prices }, { data: tokens }] = await Promise.all([
    query('GetPools().Size()'),
    get(`${API}/tokens/prices`),
    get(`${API}/token-metas`),
  ])
  const count = Number(integer(countResult[0]))
  if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid Gnoswap pool count')

  const { results, errors } = await PromisePool.withConcurrency(5)
    .for(Array.from({ length: count }, (_, i) => i))
    .process(async index => {
      const [key] = await query(`GetPools().GetByIndex(${index})`)
      if (key?.T?.value !== '16' || typeof key.V?.value !== 'string')
        throw new Error(`Missing Gnoswap pool key at index ${index}`)
      const path = key.V.value
      const parts = path.split(':')
      if (parts.length !== 3) throw new Error(`Invalid Gnoswap pool path: ${path}`)
      const balances = await query(`GetBalances(${JSON.stringify(path)})`)
      if (balances.length !== 3 || Object.keys(balances[2]).length)
        throw new Error(`Failed to read Gnoswap pool balances: ${path}`)
      return parts.slice(0, 2).map((token, i) => ({ token, amount: integer(balances[i]) }))
    })
  if (errors.length) throw errors[0]
  addBalances(api, results.flat(), prices, tokens)
}

async function staking(api) {
  const gnsPath = encodeURIComponent(GNS)
  const [[amount], { data: price }, { data: token }] = await Promise.all([
    query('GetTotalxGnsSupply()', GOV_STAKER),
    get(`${API}/tokens/${gnsPath}/prices`),
    get(`${API}/token-metas/${gnsPath}`),
  ])
  addBalances(api, [{ token: GNS, amount: integer(amount) }], [price], [token])
}

function addBalances(api, balances, prices, tokens) {
  if (!Array.isArray(prices) || !Array.isArray(tokens)) throw new Error('Missing Gnoswap token data')
  const priceByPath = new Map(prices.map(token => [token.path, token]))
  const decimalsByPath = new Map(tokens.map(token => [token.path, token.decimals]))

  let usd = new BigNumber(0)
  const unpriced = {}
  for (const { token, amount } of balances) {
    const balance = new BigNumber(amount)
    if (balance.isNegative()) throw new Error(`Negative Gnoswap reserve: ${token}`)
    if (balance.isZero()) continue
    const price = new BigNumber(priceByPath.get(token)?.usd)
    const decimals = decimalsByPath.get(token)
    if (!price.isFinite() || price.lte(0) || !Number.isInteger(decimals) || decimals < 0) {
      const key = `gnoland:${token}`
      unpriced[key] = balance.plus(unpriced[key] || 0).toFixed(0)
      console.warn(`Gnoswap: missing API price or decimals for ${token}; returning raw balance for DefiLlama pricing`)
      continue
    }
    // The API uses GNOT units (6 decimals) for wugnot, whose contract metadata says 0.
    usd = usd.plus(balance.shiftedBy(-decimals).times(price))
  }
  api.addUSDValue(usd.toNumber())
  for (const [token, amount] of Object.entries(getFixBalances('gnoland')(unpriced)))
    api.addToken(token.includes(':') ? token : `coingecko:${token}`, amount, { skipChain: true })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true, // Priced pool assets and staked GNS principal are reported as USD.
  methodology: 'TVL counts token reserves in GnoSwap pools. Staking counts GNS deposits held in governance and launchpad contracts. USD values use GnoSwap token prices.',
  gnoland: { tvl, staking },
}
