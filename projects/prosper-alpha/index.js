const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')

const WPROS = ADDRESSES.pharos.WPROS
const FACTORY = '0xefdbb0ea7647b0e21aef7a3b7a5d6a632c3116c8'
const LP_TIMELOCK = '0x152ecca16f86faa5d1fc2ed0a1b2baf5aacd794b'

async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: FACTORY,
    fromBlock: 17516201,
    eventAbi: 'event ProsperVaultLinked(address indexed r25Vault, bytes32 indexed campaignId, address indexed pToken, address market, address buyback)',
  })
  const markets = [...new Map(logs.map(log => [log.market.toLowerCase(), log])).values()]
  if (!markets.length) return
  await api.sumTokens({ owners: markets.map(({ market }) => market), tokens: [WPROS] })

  const externalPairs = await api.multiCall({ abi: 'address:externalPair', calls: markets.map(({ market }) => market) })
  const positions = new Map()
  externalPairs.forEach((pair, i) => {
    pair = pair.toLowerCase()
    if (pair === ADDRESSES.null) return
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
    if (token0 === WPROS && token1 === pToken) reserve = reserves[i].reserve0
    else if (token1 === WPROS && token0 === pToken) reserve = reserves[i].reserve1
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
  methodology: 'Counts the WPROS held by Prosper bonding-curve markets on Pharos (discovered from the production Factory creation events), plus the WPROS side of graduated V2 pools whose LP tokens are held by the Prosper LpTimeLock, pro rata to the LP it holds. pTokens and LP held by others are excluded.',
  start: '2026-09-13',
  pharos: { tvl },
}
