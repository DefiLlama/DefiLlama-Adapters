const ADDRESSES = require('../helper/coreAssets.json')
const getMarkets = require('../prosper-alpha/markets')

const WPROS = ADDRESSES.pharos.WPROS
const LP_TIMELOCK = '0x152ecca16f86faa5d1fc2ed0a1b2baf5aacd794b'
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

async function tvl(api) {
  const markets = await getMarkets(api)
  if (!markets.length) return
  const externalPairs = await api.multiCall({ abi: 'address:externalPair', calls: markets.map(({ market }) => market) })
  const positions = new Map()
  externalPairs.forEach((pair, i) => {
    pair = pair.toLowerCase()
    if (pair === ZERO_ADDRESS) return
    const pToken = markets[i].pToken.toLowerCase()
    if (positions.has(pair) && positions.get(pair) !== pToken) throw new Error('Conflicting Prosper pair tokens')
    positions.set(pair, pToken)
  })
  const pairs = [...positions.keys()]
  if (!pairs.length) return
  const [tokens0, tokens1, reserves, lpBalances, supplies] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: pairs }),
    api.multiCall({ abi: 'address:token1', calls: pairs }),
    api.multiCall({ abi: 'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)', calls: pairs }),
    api.multiCall({ abi: 'erc20:balanceOf', calls: pairs.map(target => ({ target, params: LP_TIMELOCK })) }),
    api.multiCall({ abi: 'erc20:totalSupply', calls: pairs }),
  ])
  let total = 0n
  pairs.forEach((pair, i) => {
    const token0 = tokens0[i].toLowerCase()
    const token1 = tokens1[i].toLowerCase()
    const pToken = positions.get(pair)
    let reserve
    if (token0 === WPROS.toLowerCase() && token1 === pToken) reserve = reserves[i].reserve0
    else if (token1 === WPROS.toLowerCase() && token0 === pToken) reserve = reserves[i].reserve1
    else throw new Error('Unexpected Prosper pair assets')
    const balance = BigInt(lpBalances[i])
    const supply = BigInt(supplies[i])
    if (balance === 0n || supply === 0n) return
    if (balance > supply) throw new Error('Prosper LP balance exceeds total supply')
    total += BigInt(reserve) * balance / supply
  })
  api.add(WPROS, total.toString())
}

module.exports = {
  methodology: 'Counts only the WPROS side represented by V2 LP tokens held by Prosper LpTimeLock on Pharos: current WPROS reserves multiplied by the current LP custody share, using integer arithmetic. Includes matured LP still held by the lock until withdrawn. Excludes pTokens, unrelated pairs, LP held elsewhere and inner-market reserves. This is a single-sided custody value, not the full two-token LP market value.',
  start: '2026-09-13',
  pharos: { tvl },
}
