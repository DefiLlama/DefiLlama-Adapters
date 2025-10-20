/* SOLID Protocol (Terra, phoenix-1) — Collateral-only TVL adapter
 * Now returns BALANCES ONLY (no price/exchange-rate math in adapter).
 * ampLUNA / bLUNA pricing to be handled by DefiLlama coin-prices infra.
 */

const { get } = require('../helper/http')

// ----- LCD endpoint (overridable) -----
const LCD = process.env.TERRA_LCD || 'https://terra-api.cosmosrescue.dev:8443'

// ----- Addresses -----
const ADDR = {
  // CW20 collaterals
  ampLUNA: {
    token: 'terra1ecgazyd0waaj3g7l9cmy5gulhxkps2gmxu9ghducvuypjq68mq2s5lvsct',
    custody: 'terra18uxq2k6wpsqythpakz5n6ljnuzyehrt775zkdclrtdtv6da63gmskqn7dq',
  },
  bLUNA: {
    token: 'terra17aj4ty4sz4yhgm08na8drc0v03v2jwr3waxcqrwhajj729zhl7zqnpc0ml',
    custody: 'terra1fyfrqdf58nf4fev2amrdrytq5d63njulfa7sm75c0zu4pnr693dsqlr7p9',
  },
  wSOL: {
    token: 'terra1ctelwayk6t2zu30a8v9kdg3u2gr0slpjdfny5pjp7m3tuquk32ysugyjdg',
    custody: 'terra1e32q545j90agakl32mtkacq05990cnr54czj8wp0wv3nttkrhwlqr9spf5',
  },
  wBNB: {
    token: 'terra1xc7ynquupyfcn43sye5pfmnlzjcw2ck9keh0l2w2a4rhjnkp64uq4pr388',
    custody: 'terra1fluajm00hwu9wyy8yuyf4zag7x5pw95vdlgkhh8w03pfzqj6hapsx4673t',
  },

  // IBC/native denoms (bank module)
  USDC: {
    denom: 'ibc/2C962DAB9F57FE0921435426AE75196009FAA1981BF86991203C8411F8980FDB',
    custody: 'terra1hdu4t2mrrv98rwdzps40va7me3xjme32upcw36x4cda8tx9cee9qrwdhsl',
  },
  wETH: {
    denom: 'ibc/BC8A77AFBD872FDC32A348D3FB10CC09277C266CFE52081DE341C7EC6752E674',
    custody: 'terra1lz9048tzegtspy35chwq2lmlhtwz8qq4jdvpua8yslskfnpk6yfsw06090',
  },
  wBTC: {
    denom: 'ibc/05D299885B07905B6886F554B39346EA6761246076A1120B1950049B92B922DD',
    custody: 'terra163nmjy97n7dqpdaxp6gts0xrnchn2nsg2d40wrgqnpguf0v9rvdslytfpz',
  },
}

// ----- helpers -----
function b64(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
}

// robust smart query: path form `/smart/{b64}` works across LCDs
async function smartQuery(contract, msgObj) {
  const url = `${LCD}/cosmwasm/wasm/v1/contract/${contract}/smart/${b64(msgObj)}`
  const res = await get(url)
  // some LCDs wrap under 'data' or 'result'
  return res.data || res.result || res
}

async function bankBalances(address) {
  const url = `${LCD}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`
  const res = await get(url)
  return res.balances
}

async function cw20Balance(token, address) {
  const r = await smartQuery(token, { balance: { address } })
  const bal = (r && r.balance) ? r.balance : (r?.data?.balance || '0')
  return BigInt(bal)
}

function addBig(balances, key, amount) {
  if (!amount) return
  const prev = BigInt(balances[key] || 0)
  balances[key] = (prev + BigInt(amount)).toString()
}

// ----- TVL -----
async function tvl() {
  const balances = {}

  // CW20 balances (report as raw token balances)
  for (const key of ['ampLUNA', 'bLUNA', 'wSOL', 'wBNB']) {
    const { token, custody } = ADDR[key]
    const [bal] = await Promise.all([cw20Balance(token, custody)])
    // return raw amount in smallest units (string). DefiLlama will price it.
    const raw = BigInt(bal)  // already smallest unit from contract
    addBig(balances, `terra2:${token}`, raw.toString())
  }

  // IBC/native balances (bank module)
  for (const key of ['USDC', 'wETH', 'wBTC']) {
    const { denom, custody } = ADDR[key]
    const list = await bankBalances(custody)
    const row = list.find((x) => x.denom === denom)
    if (row && row.amount) addBig(balances, denom.replace('/', ':'), row.amount)
  }

  return balances
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology:
    'TVL = sum of custody balances for SOLID collaterals (ampLUNA, bLUNA, USDC (Noble IBC), axl.WETH, axl.WBTC, wSOL (Wormhole), wBNB (Wormhole)). ' +
    'Adapter returns token balances only; pricing (including LST exchange rates) is handled by DefiLlama coin-prices infra.',
  terra2: { tvl },
}