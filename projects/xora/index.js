const { post } = require('../helper/http')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { nullAddress } = require('../helper/tokenMapping')

// XORA multi-asset custody (public addresses only)
const XRP_TREASURY = 'rhbErkS2d4H82tRbdGyFkhhc4LNtjKaC3o'
const BTC_CUSTODY = 'rsaBZHZWHqW9TSrCkAqfHKH5FEgKPiHKfe'
const BTC_ISSUER = 'rcj4KrKzMTMX1JcQ2a7KsrEeEQKYSn3Rz'
const TRX_TREASURY = 'T9zAm4AoDzKx8cuzMor7jUBQE8u56YpfQh'
const XRPL_RPC = 'https://s1.ripple.com:51234'

async function xrplRpc(body) {
  const res = await post(XRPL_RPC, body)
  const result = res?.result
  if (!result) throw new Error('XRPL RPC empty response')
  if (result.error === 'actNotFound' || result.error === 'actMalformed')
    return { notFound: true, result }
  if (result.error || result.status === 'error') {
    throw new Error(result.error_message || result.error || 'XRPL RPC error')
  }
  return { result }
}

async function rippleTvl(api) {
  const { result: info, notFound } = await xrplRpc({
    method: 'account_info',
    params: [{ account: XRP_TREASURY, ledger_index: 'validated' }],
  })
  if (notFound) throw new Error('XRP treasury account not found')
  const drops = info.account_data?.Balance
  if (drops == null) throw new Error('XRP treasury balance missing')
  const xrp = Number(drops) / 1e6
  if (!Number.isFinite(xrp) || xrp < 0) throw new Error('XRP treasury balance invalid')
  api.addCGToken('ripple', xrp)
}

// BTC is an XRPL-issued currency held in custody; report under bitcoin chain as CG bitcoin
// (same pattern as babylon / fiamma / ibtc adapters).
async function bitcoinTvl(api) {
  const { result: linesRes, notFound } = await xrplRpc({
    method: 'account_lines',
    params: [{
      account: BTC_CUSTODY,
      peer: BTC_ISSUER,
      ledger_index: 'validated',
    }],
  })
  if (notFound) throw new Error('BTC custody account not found')
  const lines = linesRes.lines || []
  const btcLine = lines.find((l) => l.currency === 'BTC' && l.account === BTC_ISSUER)
  if (!btcLine) throw new Error('BTC trust line missing on custody')
  const btc = Number(btcLine.balance)
  if (!Number.isFinite(btc) || btc < 0) throw new Error('BTC custody balance invalid')
  if (btc > 0) api.addCGToken('bitcoin', btc)
}

module.exports = {
  timetravel: false,
  methodology:
    'Counts XRP, BTC, and TRX held in the XORA treasury.',
  ripple: { tvl: rippleTvl },
  bitcoin: { tvl: bitcoinTvl },
  tron: {
    tvl: sumTokensExport({
      owners: [TRX_TREASURY],
      tokens: [nullAddress],
    }),
  },
}
