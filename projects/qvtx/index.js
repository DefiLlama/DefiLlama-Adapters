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
  return sumTokens2({ api, tokensAndOwners: [[PQUSD, WQVTX_QUSD_POOL]] })
}

async function pool2(api) {
  return sumTokens2({ api, tokensAndOwners: [[WQVTX, WQVTX_QUSD_POOL]] })
}

module.exports = {
  methodology: 'TVL counts pQUSD (fiat-backed USD stablecoin) locked in the QVTX wQVTX/pQUSD pool on Polygon. pool2 tracks wQVTX (governance token) in the same pool.',
  polygon: { tvl, pool2 },
}
