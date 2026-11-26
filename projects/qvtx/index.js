// QVTX TVL Protocol Adapter for DefiLlama
// Tracks liquidity pool TVL: wQVTX/pQUSD on Polygon (chain 137)
// wQVTX bridge: https://github.com/quant-oss/qone (ByteID REAL, anchored 2026-11-08)
// pQUSD (Polygon QUSD): 0x8d58dEbF89740Da1416d5f1904E4286096174B5A
// Protocol: https://qvtx.net

const { sumTokens2 } = require('../helper/unwrapLPs')

const WQVTX_QUSD_POOL = '0xEf12DC21C0A74a975741e975f2893Ff78F12b0C1'
const PQUSD           = '0x8d58dEbF89740Da1416d5f1904E4286096174B5A'
const WQVTX           = '0xb171FD8d04Ef43C1Fd3FE14cba5a09A7FBe3d5B4'

async function tvl(api) {
  const tokensAndOwners = [
    [PQUSD,  WQVTX_QUSD_POOL],
    [WQVTX, WQVTX_QUSD_POOL],
  ]
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology: 'Sum of tokens locked in the QVTX wQVTX/pQUSD liquidity pool on Polygon. pQUSD is a fiat-backed USD stablecoin; wQVTX is the wrapped governance token.',
  polygon: { tvl },
}