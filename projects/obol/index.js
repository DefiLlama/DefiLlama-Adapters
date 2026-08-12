const axios = require('axios')

const rstOBOL = '0x1932e815254c53B3Ecd81CECf252A5AC7f0e8BeA'
const ENDPOINT_BASE = 'https://api.obol.tech/tvs/mainnet'
const ENDPOINT_BEACON = 'https://ethereum-beacon-api.publicnode.com/eth/v1/beacon/states/head/validators'
const BEACON_BATCH_SIZE = 2000
const stakeForSharesABI = "function stakeForShares(uint256 _shares) view returns (uint256)"

const buildUrl = ({ limit, page, dateString }) =>
  `${ENDPOINT_BASE}?limit=${limit}&page=${page}&details=true${dateString ? `&timestamp=${dateString}` : ''}`

async function fetchObolBalances({ dateString, limit = 1000, pageConcurrency = 3 } = {}) {
  const firstPayload = (await axios.get(buildUrl({ limit, page: 0, dateString }))).data
  const totalPages = Number.isInteger(firstPayload?.total_pages)
    ? firstPayload.total_pages
    : Math.ceil((firstPayload?.total_count ?? firstPayload?.balances?.length ?? 0) / limit)

  const balances = [...(firstPayload?.balances ?? [])]
  const remaining = Array.from({ length: totalPages - 1 }, (_, i) => i + 1)
  for (let i = 0; i < remaining.length; i += pageConcurrency) {
    const chunk = remaining.slice(i, i + pageConcurrency)
    const payloads = await Promise.all(chunk.map(page => axios.get(buildUrl({ limit, page, dateString }))))
    for (const r of payloads) balances.push(...(r.data?.balances ?? []))
  }
  return balances
}

function normalizePubkey(pk) {
  if (!pk) return null
  const s = String(pk).toLowerCase()
  return s.startsWith('0x') ? s : `0x${s}`
}

async function fetchBeaconValidators(pubkeys) {
  const out = []
  for (let i = 0; i < pubkeys.length; i += BEACON_BATCH_SIZE) {
    const ids = pubkeys.slice(i, i + BEACON_BATCH_SIZE)
    const { data } = await axios.post(ENDPOINT_BEACON, { ids })
    out.push(...(data?.data ?? []))
  }
  return out
}

const GWEI_TO_WEI = 1_000_000_000n

const tvl = async (api) => {
  const now = Math.floor(Date.now() / 1000)
  const isHistorical = api.timestamp && api.timestamp < now - 86400

  // uses obol api balances for historical queries
  if (isHistorical) {
    const dateString = new Date(api.timestamp * 1000).toISOString().slice(0, 10)
    const balances = await fetchObolBalances({ dateString })
    let totalWei = 0n
    for (const b of balances) {
      if (b.balance_eth) totalWei += BigInt(Math.floor(b.balance_eth * 1e9)) * GWEI_TO_WEI
    }
    api.addGasToken(totalWei)
    return
  }

  const balances = await fetchObolBalances()
  const pubkeys = [...new Set(balances.map(b => normalizePubkey(b.public_key)).filter(Boolean))]
  const validators = await fetchBeaconValidators(pubkeys)
  let totalWei = 0n
  for (const v of validators) {
    if (v?.balance) totalWei += BigInt(v.balance) * GWEI_TO_WEI
  }
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
