const axios = require('axios')
axios.defaults.headers.common['User-Agent'] = 'DefiLlama-Nolus-Adapter/1.0 (https://defillama.com)'
const { queryContract, queryManyContracts, queryContracts } = require('../helper/chain/cosmos')
const { sleep } = require('../helper/utils')

// batch config
const BATCH = { size: 30, pauseMs: 300, jitterMs: 120, maxRetries: 2 }
const sleepMs = (n) => new Promise(r => setTimeout(r, n))

// Osmosis Noble USDC Protocol Contracts (OSMOSIS-OSMOSIS-USDC_NOBLE) pirin-1
const osmosisNobleOracleAddr = 'nolus1vjlaegqa7ssm2ygf2nnew6smsj8ref9cmurerc7pzwxqjre2wzpqyez4w6'
const osmosisNobleLppAddr = 'nolus1ueytzwqyadm6r0z8ajse7g6gzum4w3vv04qazctf8ugqrrej6n4sq027cf'
const osmosisNobleLeaserAddr = 'nolus1dca9sf0knq3qfg55mv2sn03rdw6gukkc4n764x5pvdgrgnpf9mzsfkcjp6'

// Osmosis ATOM Protocol Contracts (OSMOSIS-OSMOSIS-ATOM) pirin-1
const osmosisAtomOracleAddr = 'nolus16xt97qd5mc2zkya7fs5hvuavk92cqds82qjuq6rf7p7akxfcuxcs5u2280'
const osmosisAtomLeaserAddr = 'nolus1rspfrcnjn9vumct3nn20gktksrcjstrh5z8qp340lr8s7fmasd2qmjydk2'
const osmosisAtomLppAddr = 'nolus1u0zt8x3mkver0447glfupz9lz6wnt62j70p5fhhtu3fr46gcdd9s5dz9l6'

// Osmosis allBTC Protocol Contracts (OSMOSIS-OSMOSIS-ALL_BTC) pirin-1
const osmosisBtcOracleAddr = 'nolus1y0nlrnw25mh2vxhaupamwca4wdvuxs26tq4tnxgjk8pw0gxevwfq5ry07c'
const osmosisBtcLeaserAddr = 'nolus1dzwc9hu9aqlmm7ua4lfs2lyafmy544dd8vefsmjw57qzcanhsvgsf4u3ld'
const osmosisBtcLppAddr = 'nolus1w2yz345pqheuk85f0rj687q6ny79vlj9sd6kxwwex696act6qgkqfz7jy3'

// Osmosis allSOL Protocol Contracts (OSMOSIS-OSMOSIS-ALL_SOL) pirin-1
const osmosisSolOracleAddr = 'nolus153kmhl85vavd03r9c7ardw4fgydge6kvvhrx5v2uvec4eyrlwthsejc6ce'
const osmosisSolLeaserAddr = 'nolus1lj3az53avjf8s9pzwvfe86d765kd7cmnhjt76vtqxjvn08xu0c6saumtza'
const osmosisSolLppAddr = 'nolus1qufnnuwj0dcerhkhuxefda6h5m24e64v2hfp9pac5lglwclxz9dsva77wm'

// Osmosis AKT Protocol Contracts (OSMOSIS-OSMOSIS-AKT) pirin-1
const osmosisAktOracleAddr = 'nolus12sx0kr60rptp846z2wvuwyxn47spg55dcnzwrhl4f7nfdduzsrxq7rfetn'
const osmosisAktLeaserAddr = 'nolus1shyx34xzu5snjfukng323u5schaqcj4sgepdfcv7lqfnvntmq55sj94hqt'
const osmosisAktLppAddr = 'nolus1lxr7f5xe02jq6cce4puk6540mtu9sg36at2dms5sk69wdtzdrg9qq0t67z'

// Astroport Noble USDC Protocol Contracts (NEUTRON-ASTROPORT-USDC_NOBLE) pirin-1
const astroportNobleOracleAddr = 'nolus1vhzdx9lqexuqc0wqd48c5hc437yzw7jy7ggum9k25yy2hz7eaatq0mepvn'
const astroportNobleLeaserAddr = 'nolus1aftavx3jaa20srgwclakxh8xcc84nndn7yvkq98k3pz8ydhy9rvqkhj8dz'
const astroportNobleLppAddr = 'nolus17vsedux675vc44yu7et9m64ndxsy907v7sfgrk7tw3xnjtqemx3q6t3xw6'

const _6Zeros = 1000000


async function getLeaseCodeId(leaserAddress) {
  const leaserContract = await queryContract({ contract: leaserAddress, chain: 'nolus', data: { 'config': {} } })
  const leaseCodeId = leaserContract?.config?.lease_code
  if (!leaseCodeId) {
    return 0
  }

  return leaseCodeId
}

async function getLeaseContracts(leaseCodeId) {
  return await queryContracts({ chain: 'nolus', codeId: leaseCodeId, })
}

// Commented out and replaced by throttled alternative below
/*
async function getLeases(leaseAddresses) {
  return await queryManyContracts({ permitFailure: true, contracts: leaseAddresses, chain: 'nolus', data: {"state":{}} })
}
*/

async function getLeasesThrottled(leaseAddresses) {
  const results = new Array(leaseAddresses.length).fill(null)

  for (let i = 0; i < leaseAddresses.length; i += BATCH.size) {
    const start = i
    const end = Math.min(i + BATCH.size, leaseAddresses.length)
    const chunk = leaseAddresses.slice(start, end)

    let ok = false
    for (let attempt = 0; attempt <= BATCH.maxRetries; attempt++) {
      try {
        const res = await queryManyContracts({
          contracts: chunk,
          chain: 'nolus',
          data: { state: {} },
          permitFailure: true,
        })
        // place results (guard undefined)
        for (let j = 0; j < chunk.length; j++) {
          results[start + j] = (res && res[j] !== undefined) ? res[j] : null
        }
        ok = true
        break
      } catch (e) {
        if (attempt === BATCH.maxRetries) {
          // if we've gone through all the retries, throw an error if something is wrong (e.g. rate limiting in the node)
          throw new Error(`[states] batch ${start}-${end} failed after ${attempt + 1} attempts: ${e?.message || e}`)
        }
        await sleepMs(300 * (attempt + 1) + Math.floor(Math.random() * 200))
      }
    }

    // pacing between batches
    if (ok && end < leaseAddresses.length) {
      const pause = BATCH.pauseMs + Math.floor(Math.random() * BATCH.jitterMs)
      await sleepMs(pause)
    }
  }

  // End-to-end invariant: no missing states`
  const missing = results.reduce((n, v) => n + (v == null ? 1 : 0), 0)
  if (missing > 0) {
    // HARD FAIL - better to error than publish partial TVL
    throw new Error(`[states] incomplete data: missing ${missing} of ${results.length}`)
  }

  return results
}

async function getLppTvl(lppAddresses) {  
  const lpps = await queryManyContracts({ contracts: lppAddresses, chain: 'nolus', data: { 'lpp_balance': [] } })
  
  let totalLpp = 0
  let divisor = _6Zeros; // Default 6 decimals

  // Adjust divisor based on specific addresses for allBTC and allSOL
  if (lppAddresses.includes(osmosisBtcLppAddr)) {
    divisor = 100000000; // 8 decimals for BTC
  } else if (lppAddresses.includes(osmosisSolLppAddr)) {
    divisor = 1000000000; // 9 decimals for SOL
  }

  lpps.forEach(v => {
    totalLpp += Number(v.balance.amount)
  })

  return totalLpp / divisor;
}

function sumAssets(api, leases, currencies) {
  if (!Array.isArray(leases)) return
  leases.forEach(v => {
    if (!v || !v.opened || !v.opened.amount) return
    const ticker = v.opened.amount.ticker
    const amount = parseInt(v.opened.amount.amount, 10)
    // skip weird/empty
    if (!Number.isFinite(amount)) return

    const currencyData = find(currencies, (n) => n && n.ticker === ticker)
    if (!currencyData || !currencyData.dex_symbol) return

    api.add(currencyData.dex_symbol, amount)
  })
}

function find(collection, predicate) {
  for (let i = 0; i < collection.length; i++) {
    if (predicate(collection[i])) {
      return collection[i]
    }
  }

  return undefined
}

async function tvl(api, protocols) {
  for (let i = 0; i < protocols.length; i++) {
    await sleep(2000)
    const p = protocols[i]
    const oracleData = await queryContract({ contract: p.oracle, chain: 'nolus', data: { 'currencies': {} } })
    const leaseCodeId = await getLeaseCodeId(p.leaser)
    const leaseContracts = await getLeaseContracts(leaseCodeId)
    const leases = await getLeasesThrottled(leaseContracts)
    sumAssets(api, leases, oracleData)
  }
}

module.exports = {
  methodology: 'The combined total of lending pool assets and the current market value of active margin positions',
  nolus: {
    tvl: async () => {
      return {
        'usd-coin': await getLppTvl([osmosisNobleLppAddr, astroportNobleLppAddr]),
        'osmosis-allbtc': await getLppTvl([osmosisBtcLppAddr]),
        'osmosis-allsol': await getLppTvl([osmosisSolLppAddr]),
        'akash-network': await getLppTvl([osmosisAktLppAddr]),
        'cosmos': await getLppTvl([osmosisAtomLppAddr])
      }
    }
  },
  neutron: {
    tvl: async (api) => {
      return await tvl(api, [
        { leaser: astroportNobleLeaserAddr, oracle: astroportNobleOracleAddr },
      ])
    }
  },
  osmosis: {
    tvl: async (api) => {
      return await tvl(api, [
        { leaser: osmosisNobleLeaserAddr, oracle: osmosisNobleOracleAddr },
        { leaser: osmosisAtomLeaserAddr, oracle: osmosisAtomOracleAddr },
        { leaser: osmosisBtcLeaserAddr, oracle: osmosisBtcOracleAddr },
        { leaser: osmosisSolLeaserAddr, oracle: osmosisSolOracleAddr },
        { leaser: osmosisAktLeaserAddr, oracle: osmosisAktOracleAddr }
      ])
    }
  }
}

// node test.js projects/nolus/index.js
