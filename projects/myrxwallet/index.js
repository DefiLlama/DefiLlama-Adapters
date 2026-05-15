// DefiLlama TVL Adapter -- MyRxWallet DEX (MYRX-MAINNET, Chain 8472)
// Tracks liquidity in WMRT/WBTC and WMRT/MUSD pairs

const RPC = 'https://rpc.myrxwallet.io'

const WMRT_WBTC_PAIR = '0x16Bf6e74B9feE4306a7D268468Fc4d45C2F4B0C3'
const WMRT_MUSD_PAIR = '0xf1946991eA67CdBB8d74b3124003D55A2069bd2e'
const WMRT           = '0x00e69754c21090d69D29a2abe3B6CF153D3F1dF7'

async function ethCall(target, data) {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_call', params: [{ to: target, data }, 'latest'], id: 1 }),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error.message)
  return json.result
}

function parseReserves(raw) {
  return [BigInt('0x' + raw.slice(2, 66)), BigInt('0x' + raw.slice(66, 130))]
}

async function tvl(api) {
  const [raw0, tok0r0] = await Promise.all([
    ethCall(WMRT_WBTC_PAIR, '0x0902f1ac'),
    ethCall(WMRT_WBTC_PAIR, '0x0dfe1681'),
  ])
  const [r0a, r0b] = parseReserves(raw0)
  const tok0_wbtc = ('0x' + tok0r0.slice(-40)).toLowerCase()
  const [wmrt0, wbtc0] = tok0_wbtc === WMRT.toLowerCase() ? [r0a, r0b] : [r0b, r0a]

  api.add('bitcoin', Number(wbtc0) / 1e8)
  if (wmrt0 > 0n && wbtc0 > 0n) {
    const wmrtPriceBtc = Number(wbtc0) / 1e8 / (Number(wmrt0) / 1e18)
    api.add('bitcoin', (Number(wmrt0) / 1e18) * wmrtPriceBtc)
  }

  const [raw1, tok0r1] = await Promise.all([
    ethCall(WMRT_MUSD_PAIR, '0x0902f1ac'),
    ethCall(WMRT_MUSD_PAIR, '0x0dfe1681'),
  ])
  const [r1a, r1b] = parseReserves(raw1)
  const tok0_musd = ('0x' + tok0r1.slice(-40)).toLowerCase()
  const [wmrt1, musd1] = tok0_musd === WMRT.toLowerCase() ? [r1a, r1b] : [r1b, r1a]

  api.add('usd-coin', Number(musd1) / 1e8)
  if (wmrt1 > 0n && musd1 > 0n) {
    const wmrtPriceUsd = (Number(musd1) / 1e8) / (Number(wmrt1) / 1e18)
    api.add('usd-coin', (Number(wmrt1) / 1e18) * wmrtPriceUsd)
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: 'Sums token reserves in WMRT/WBTC and WMRT/MUSD DEX pairs on MYRX-MAINNET (Chain 8472). WBTC valued as BTC. MUSD is a USD-pegged stablecoin at 1 USD.',
  start: 1747267200,
  myrx: { tvl },
}
