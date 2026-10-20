const { get } = require('../helper/http')
const { PromisePool } = require('@supercharge/promise-pool')

const RPC = 'https://rpc.gno.land'
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
  const count = Number(integer((await query('GetPools().Size()'))[0]))
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
  results.flat().forEach(({ token, amount }) => api.add(token, amount))
}

async function staking(api) {
  const [amount] = await query('GetTotalxGnsSupply()', GOV_STAKER)
  api.add(GNS, integer(amount))
}

module.exports = {
  timetravel: false,
  methodology: 'TVL counts token reserves in GnoSwap pools. Staking counts GNS deposited in governance staking, including launchpad deposits, measured by the total xGNS supply.',
  gnoland: { tvl, staking },
}
