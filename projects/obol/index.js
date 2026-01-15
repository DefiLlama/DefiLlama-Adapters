const axios = require('axios')

const rstOBOL = '0x1932e815254c53B3Ecd81CECf252A5AC7f0e8BeA'
const ENDPOINT_BASE = 'https://api.obol.tech/tvs/mainnet'
const ENDPOINT_BEACON = 'https://ethereum-beacon-api.publicnode.com/eth/v1/beacon/states/head/validators/'
const stakeForSharesABI = "function stakeForShares(uint256 _shares) view returns (uint256)"

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const buildUrl = ({ limit, page, dateString }) => `${ENDPOINT_BASE}?limit=${limit}&page=${page}&details=true&timestamp=${encodeURIComponent(dateString)}`

async function fetchBalancesForTimestamp(tsSeconds, { limit = 1000, delayMs = 500 } = {}) {
  const dateString = new Date(tsSeconds * 1000).toISOString().slice(0, 10)

  const firstUrl = buildUrl({ limit, page: 0, dateString })
  const firstPayload = (await axios.get(firstUrl)).data

  const firstBalances = firstPayload?.balances ?? []
  const totalPages = Number.isInteger(firstPayload?.total_pages)
    ? firstPayload.total_pages
    : Math.ceil((firstPayload?.total_count ?? firstBalances.length) / limit)

  const allBalances = [...firstBalances]

  for (let page = 1; page < totalPages; page++) {
    await sleep(delayMs)
    const url = buildUrl({ limit, page, dateString })
    const payload = (await axios.get(url)).data
    const balances = payload?.balances ?? []
    if (!balances.length) break
    allBalances.push(...balances)
  }

  return { date: dateString, totalPages, count: allBalances.length, balances: allBalances }
}

function normalizePubkey(pk) {
  if (!pk) return null
  const s = String(pk).toLowerCase()
  return s.startsWith('0x') ? s : `0x${s}`
}

async function fetchBeaconValidator(pubkey) {
  const res = await axios.get(`${ENDPOINT_BEACON}${pubkey}`)
  return res?.data?.data
}

async function asyncPool(limit, arr, iteratorFn) {
  const out = []
  for (let i = 0; i < arr.length; i += limit) {
    const chunk = arr.slice(i, i + limit)
    out.push(...await Promise.all(chunk.map(iteratorFn)))
  }
  return out
}

const GWEI_TO_WEI = 1_000_000_000n

const tvl = async (api) => {
  const ts = api.timestamp - 86400
  const { balances } = await fetchBalancesForTimestamp(ts, { limit: 1000, delayMs: 500 })

  const pubkeys = [...new Set(
    balances.map(({ public_key }) => normalizePubkey(public_key)).filter(Boolean)
  )]

  const concurrency = 10
  const perRequestDelayMs = 80

  const results = await asyncPool(concurrency, pubkeys, async (pubkey) => {
    await sleep(perRequestDelayMs)
    try {
      const value = await fetchBeaconValidator(pubkey)
      if (!value?.balance) return 0n
      return BigInt(value.balance) * GWEI_TO_WEI
    } catch (e) {
      return 0n
    }
  })

  let totalWei = 0n
  for (const wei of results) totalWei += wei

  api.addGasToken(totalWei)
}

const staking = async (api) => {
  if (api.block < 22318392) return
  const underlying = await api.call({ target: rstOBOL, abi: 'address:STAKE_TOKEN' })
  const supply = await api.call({ target: rstOBOL, abi: 'uint256:totalShares' })
  const stakeForShares = await api.call({ target: rstOBOL, abi: stakeForSharesABI, params: [supply] })
  api.add(underlying, stakeForShares)
}

module.exports = {
  methodology: "Total value of ETH staked on Obol's Distributed Validators",
  ethereum: { tvl, staking },
}
