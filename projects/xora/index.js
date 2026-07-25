const { post } = require('../helper/http')
const { sumTokensExport } = require('../helper/unwrapLPs')
const { nullAddress } = require('../helper/tokenMapping')

// XORA multi-asset custody (public addresses only)
const XRP_TREASURY = 'rhbErkS2d4H82tRbdGyFkhhc4LNtjKaC3o'
const BTC_CUSTODY = 'rsaBZHZWHqW9TSrCkAqfHKH5FEgKPiHKfe'
const BTC_ISSUER = 'rcj4KrKzMTMX1JcQ2a7KsrEeEQKYSn3Rz'
const TRX_TREASURY = 'T9zAm4AoDzKx8cuzMor7jUBQE8u56YpfQh'

const XRPL_RPC = 'https://s1.ripple.com:51234'

async function rippleTvl(api) {
  // XRP treasury (native)
  const infoBody = {
    method: 'account_info',
    params: [{ account: XRP_TREASURY, ledger_index: 'validated' }],
  }
  const info = await post(XRPL_RPC, infoBody)
  if (info?.result?.account_data?.Balance) {
    api.addCGToken('ripple', Number(info.result.account_data.Balance) / 1e6)
  }

  // BTC held in XRPL custody (currency code BTC) — reported as Bitcoin
  const linesBody = {
    method: 'account_lines',
    params: [{ account: BTC_CUSTODY, ledger_index: 'validated' }],
  }
  const linesRes = await post(XRPL_RPC, linesBody)
  const lines = linesRes?.result?.lines || []
  const btcLine = lines.find(
    (l) => l.currency === 'BTC' && l.account === BTC_ISSUER,
  )
  if (btcLine && Number(btcLine.balance) > 0) {
    api.addCGToken('bitcoin', Number(btcLine.balance))
  }
}

module.exports = {
  methodology:
    'Counts XRP in the XORA XRPL treasury, BTC in XORA XRPL custody, and TRX in the XORA Tron treasury.',
  start: 1772841600, // 2026-03-07
  ripple: {
    tvl: rippleTvl,
  },
  tron: {
    tvl: sumTokensExport({
      owners: [TRX_TREASURY],
      tokens: [nullAddress],
    }),
  },
}
