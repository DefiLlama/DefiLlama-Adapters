/**
 * L1 native-staking helpers.
 *
 * These pull *delegated / bonded* stake, which is invisible to the usual
 * balance lookups (cosmos bank module, bittensor System.Account, ...). Meant for
 * CEX adapters where a chunk of the reserves sits with validators.
 */
const sdk = require('@defillama/sdk')
const ADDRESSES = require('./coreAssets.json')
const { get, post } = require('./http')
const { getEnv } = require('./env')
const { queryV1Beta1V2 } = require('./chain/cosmos')
const bittensor = require('./chain/bittensor')
const starknet = require('./chain/starknet')

// ---------------------------------------------------------------- cosmos-sdk

// Bonded stake per delegator. Excludes tokens in the unbonding queue - those are
// picked up by cosmosUnbonding.
async function cosmosStaked(api, owners) {
  for (const owner of owners) {
    const delegations = await queryV1Beta1V2({
      api,
      url: `staking/v1beta1/delegations/${owner}`,
      dataKey: 'delegation_responses',
    })
    delegations.forEach(({ balance }) => api.add(balance.denom, balance.amount))
  }
}

// Tokens mid-unbonding (21d on most chains) still belong to the delegator.
async function cosmosUnbonding(api, owners) {
  for (const owner of owners) {
    const unbondings = await queryV1Beta1V2({
      api,
      url: `staking/v1beta1/delegators/${owner}/unbonding_delegations`,
      dataKey: 'unbonding_responses',
    })
    unbondings.forEach(({ entries = [] }) =>
      entries.forEach(({ balance }) => api.add(api.chain === 'injective' ? 'inj' : undefined, balance))
    )
  }
}

// ---------------------------------------------------------------------- sui

async function suiStaked(api, owners) {
  for (const owner of owners) {
    const stakes = await post(getEnv('SUI_RPC'), { jsonrpc: '2.0', id: 1, method: 'suix_getStakes', params: [owner] })
    for (const pool of stakes.result ?? []) {
      for (const { principal, estimatedReward } of pool.stakes ?? []) {
        api.add(ADDRESSES.sui.SUI, principal)
        if (estimatedReward) api.add(ADDRESSES.sui.SUI, estimatedReward)
      }
    }
  }
}

// ------------------------------------------------------------------- aptos

const APTOS_RPC = 'https://fullnode.mainnet.aptoslabs.com/v1'

// get_stake returns [active, inactive, pending_inactive] octas for a delegator
// in a given delegation pool. All three are still the delegator's funds.
async function aptosStaked(api, delegators) {
  for (const { owner, pools } of delegators) {
    for (const pool of pools) {
      const res = await post(`${APTOS_RPC}/view`, {
        function: '0x1::delegation_pool::get_stake',
        type_arguments: [],
        arguments: [pool, owner],
      })
      res.forEach(amount => api.add(ADDRESSES.aptos.APT, amount))
    }
  }
}

// ------------------------------------------------------------------ cardano

// Koios reports the full controlled stake of a payment address, staked or not,
// so this replaces (rather than supplements) a plain balance lookup.
async function cardanoStaked(api, owners) {
  const rows = await post('https://api.koios.rest/api/v1/address_info', { _addresses: owners })
  rows.forEach(({ balance }) => api.addGasToken(balance))
}

// ---------------------------------------------------------------- algorand

// An account with status "Online" has its entire balance participating in
// consensus, so the whole amount is stake.
async function algorandStaked(api, owners) {
  for (const owner of owners) {
    const acc = await get(`https://mainnet-api.algonode.cloud/v2/accounts/${owner}`)
    if (acc.status === 'Online') api.addCGToken('algorand', acc.amount / 1e6)
  }
}

// ------------------------------------------------------------------- near

// A delegator's stake lives inside each staking-pool contract, so the pools have
// to be named. get_account_total_balance covers staked + unstaked-but-unclaimed.
async function nearStaked(api, delegators) {
  for (const { owner, pools } of delegators) {
    for (const pool of pools) {
      const total = await nearCall(pool, 'get_account_total_balance', { account_id: owner })
      api.addCGToken('near', Number(total) / 1e24)
    }
  }
}

async function nearCall(contract, method, args) {
  const { result } = await post('https://rpc.mainnet.near.org', {
    jsonrpc: '2.0', id: 1, method: 'query',
    params: {
      request_type: 'call_function', finality: 'final', account_id: contract,
      method_name: method, args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
    },
  })
  return JSON.parse(Buffer.from(result.result).toString())
}

// ------------------------------------------------------------------- neo3

// NEO is staked by holding it (voting for a council candidate does not move the
// balance), so this reports the NEP-17 NEO/GAS holdings of the account. Only the
// two native assets are counted - the rest of an account's NEP-17 list is spam.
const NEO3_NATIVE = {
  '0xd2a4cff31913016155e38e474a2c06d08be276cf': { id: 'gas', decimals: 8 },
  '0xef4073a0f2b305a38ec4050e4d3d28bc40ea63f5': { id: 'neo', decimals: 0 },
}

async function neo3Staked(api, owners) {
  for (const owner of owners) {
    const { result } = await post('https://mainnet1.neo.coz.io:443', {
      jsonrpc: '2.0', id: 1, method: 'getnep17balances', params: [owner],
    })
    for (const { assethash, amount } of result.balance ?? []) {
      const native = NEO3_NATIVE[assethash.toLowerCase()]
      if (native) api.addCGToken(native.id, Number(amount) / 10 ** native.decimals)
    }
  }
}

// --------------------------------------------------------------- starknet

// STRK staking leaves the tokens in the delegator's account, so the STRK balance
// *is* the staked position. Uses the starknet helper's own rpc/abi handling.
async function starknetStaked(api, owners) {
  return starknet.sumTokens({ api, owners, tokens: [ADDRESSES.starknet.STRK] })
}

// ---------------------------------------------------------------- conflux

async function confluxStaked(api, owners) {
  for (const owner of owners) {
    const { result } = await post('https://main.confluxrpc.com', {
      jsonrpc: '2.0', id: 1, method: 'cfx_getStakingBalance', params: [owner, 'latest_state'],
    })
    api.addGasToken(BigInt(result).toString())
  }
}

// ------------------------------------------------------------------- aleo

// credits.aleo `bonded` mapping -> plaintext struct { validator, microcredits }
async function aleoStaked(api, owners) {
  for (const owner of owners) {
    const raw = await get(`https://api.explorer.provable.com/v1/mainnet/program/credits.aleo/mapping/bonded/${owner}`)
    if (!raw) continue
    const micro = /microcredits:\s*(\d+)u64/.exec(raw)
    if (micro) api.addCGToken('aleo', Number(micro[1]) / 1e6)
  }
}

// -------------------------------------------------------------- bittensor

const {
  rpc, getFinalizedHead, getStorage, subtensorPrefix, hexToBuf, keyHex, blake128, u16le, u64LE, u128LE,
} = bittensor

const b2c = (buf) => Buffer.concat([blake128(buf), buf]) // Blake2_128Concat
const i64LE = (b, o = 0) => { let v = u64LE(b, o); if (v & (1n << 63n)) v -= (1n << 64n); return v }
// V2 SafeDecimal {mantissa:u128, exponent:i64}: real = m * 2^e
const fpV2 = (b) => (!b || b.length < 24) ? 0 : Number(u128LE(b, 0)) * Math.pow(2, Number(i64LE(b, 16)))
// V1 U64F64 {bits:u128}: real = bits / 2^64
const fpV1 = (b) => (!b || b.length < 16) ? 0 : Number(u128LE(b, 0)) / Math.pow(2, 64)

async function getMany(keyBufs, at) {
  if (!keyBufs.length) return new Map()
  const keys = keyBufs.map(keyHex)
  const res = await rpc('state_queryStorageAt', [keys, at])
  const out = new Map(keys.map((k) => [k, null]))
  for (const cs of res) for (const [k, v] of cs.changes) out.set(k, v)
  return out
}

async function netuidsUnder(pfx, at) {
  const out = []; let start = keyHex(pfx)
  for (;;) {
    const keys = await rpc('state_getKeysPaged', [keyHex(pfx), 200, start, at])
    if (!keys.length) break
    for (const kh of keys) { const t = hexToBuf(kh).subarray(pfx.length); out.push(t[0] | (t[1] << 8)) }
    if (keys.length < 200) break
    start = keys[keys.length - 1]
  }
  return out
}

/**
 * Staked TAO for a coldkey, added as per-subnet alpha (priced via the subnet AMM).
 *
 * Staked TAO lives in SubtensorModule dTAO share pools, not System.Account, so
 * chain/bittensor's free-balance lookup misses all of it. Walks
 * coldkey -> StakingHotkeys -> Alpha shares -> alpha, pinned to one finalized
 * block so the multi-step read is a consistent snapshot.
 */
async function bittensorStaked(api, coldkeys) {
  const at = await getFinalizedHead()
  for (const coldkey of coldkeys) {
    const cold = hexToBuf(coldkey)

    // Hotkeys this coldkey stakes to: StakingHotkeys(cold) -> Vec<AccountId32>.
    const shRaw = await getStorage(Buffer.concat([subtensorPrefix('StakingHotkeys'), b2c(cold)]), at)
    const hotkeys = []
    if (shRaw) {
      const b = hexToBuf(shRaw), mode = b[0] & 3
      let count, off
      if (mode === 0) { count = b[0] >> 2; off = 1 }
      else if (mode === 1) { count = (b[0] | (b[1] << 8)) >> 2; off = 2 }
      else if (mode === 2) { count = (b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 2; off = 4 }
      else throw new Error('unexpected compact vec length')
      for (let i = 0; i < count; i++) { hotkeys.push(Buffer.from(b.subarray(off, off + 32))); off += 32 }
    }

    const aV2 = (hot) => Buffer.concat([subtensorPrefix('AlphaV2'), b2c(hot), b2c(cold)])
    const aV1 = (hot) => Buffer.concat([subtensorPrefix('Alpha'), b2c(hot), b2c(cold)])
    const entries = []
    for (const hot of hotkeys) {
      for (const n of await netuidsUnder(aV2(hot), at)) entries.push({ hot, net: n, v: 2 })
      for (const n of await netuidsUnder(aV1(hot), at)) entries.push({ hot, net: n, v: 1 })
    }

    const reads = []
    for (const e of entries) {
      reads.push(e.v === 2 ? Buffer.concat([aV2(e.hot), u16le(e.net)]) : Buffer.concat([aV1(e.hot), u16le(e.net)]))
      reads.push(Buffer.concat([subtensorPrefix(e.v === 2 ? 'TotalHotkeySharesV2' : 'TotalHotkeyShares'), b2c(e.hot), u16le(e.net)]))
      reads.push(Buffer.concat([subtensorPrefix('TotalHotkeyAlpha'), b2c(e.hot), u16le(e.net)]))
    }
    const vals = await getMany(reads, at)
    const V = (buf) => vals.get(keyHex(buf))

    for (const e of entries) {
      let alpha
      if (e.v === 2) {
        const share = fpV2(hexToBuf(V(Buffer.concat([aV2(e.hot), u16le(e.net)])) || '0x'))
        if (!share) continue
        const totShares = fpV2(hexToBuf(V(Buffer.concat([subtensorPrefix('TotalHotkeySharesV2'), b2c(e.hot), u16le(e.net)])) || '0x'))
        const taRaw = V(Buffer.concat([subtensorPrefix('TotalHotkeyAlpha'), b2c(e.hot), u16le(e.net)]))
        const totAlpha = taRaw ? Number(u64LE(hexToBuf(taRaw))) : 0
        alpha = totShares > 0 ? (share / totShares) * totAlpha : 0
      } else {
        alpha = fpV1(hexToBuf(V(Buffer.concat([aV1(e.hot), u16le(e.net)])) || '0x'))
        if (!alpha) continue
      }
      api.add(e.net.toString(), alpha)
    }
  }
}

module.exports = {
  cosmosStaked,
  cosmosUnbonding,
  suiStaked,
  aptosStaked,
  nearStaked,
  neo3Staked,
  starknetStaked,
  cardanoStaked,
  algorandStaked,
  confluxStaked,
  aleoStaked,
  bittensorStaked,
}
