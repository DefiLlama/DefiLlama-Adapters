const { get } = require('../http')
const sdk = require('@defillama/sdk')

const TOKENS_API = 'https://api.carbon.network/carbon/coin/v1/tokens'
const GECKO_MAP_API = 'https://api-insights.carbon.network/info/denom_gecko_map'

// fallback when api-insights.carbon.network is down (it has been returning 503 since 2026-07):
// carbon token symbol -> coingecko id, covering the assets that carry TVL on Demex / Nitron
const symbolToGecko = {
  SWTH: 'switcheo', DMX: 'switcheo', rSWTH: 'switcheo',
  USD: 'usd-coin', USDC: 'usd-coin', 'USDC.e': 'usd-coin', axlUSDC: 'usd-coin', USDT: 'tether', BUSD: 'binance-usd', DAI: 'dai', USK: 'usk', USDY: 'ondo-us-dollar-yield',
  ETH: 'ethereum', BETH: 'ethereum', wstETH: 'wrapped-steth', cbETH: 'coinbase-wrapped-staked-eth', mETH: 'mantle-staked-ether', cmETH: 'mantle-restaked-eth',
  WBTC: 'wrapped-bitcoin', cbBTC: 'coinbase-wrapped-btc', FBTC: 'ignition-fbtc', LBTC: 'lombard-staked-btc',
  ATOM: 'cosmos', stATOM: 'stride-staked-atom', stkATOM: 'stkatom', dATOM: 'drop-staked-atom',
  OSMO: 'osmosis', stOSMO: 'stride-staked-osmo', TIA: 'celestia', stTIA: 'stride-staked-tia', milkTIA: 'milkyway-staked-tia',
  INJ: 'injective-protocol', stINJ: 'stride-staked-injective', DYDX: 'dydx-chain', stDYDX: 'stride-staked-dydx', stkDYDX: 'pstake-staked-dydx',
  EVMOS: 'evmos', stEVMOS: 'stride-staked-evmos', KUJI: 'kujira', ampKUJI: 'eris-amplified-kuji', MNTA: 'mantadao',
  LUNA: 'terra-luna-2', stLUNA: 'stride-staked-luna', ampLUNA: 'eris-amplified-luna', LUNC: 'terra-luna', USTC: 'terrausd',
  STARS: 'stargaze', stSTARS: 'stride-staked-stars', STRD: 'stride', SCRT: 'secret', IRIS: 'iris-network', ARCH: 'archway', sARCH: 'archway',
  DYM: 'dymension', stDYM: 'stride-staked-dym', SAGA: 'saga-2', stSAGA: 'stride-staked-saga', LVN: 'levana-protocol', AXL: 'axelar', BLD: 'agoric',
  JUNO: 'juno-network', CANTO: 'canto', CMDX: 'comdex', DEC: 'decentr', XPRT: 'persistence', PSTAKE: 'pstake-finance', SOMM: 'sommelier', FIS: 'stafi', IBCX: 'ibc-index', SEI: 'sei-network',
  BNB: 'binancecoin', AVAX: 'avalanche-2', MNT: 'mantle', SOL: 'solana', POL: 'polygon-ecosystem-token', ARB: 'arbitrum', OP: 'optimism',
  NEO: 'neo', bNEO: 'neo', NNEO: 'neo', GAS: 'gas', FLM: 'flamingo-finance', ZIL: 'zilliqa', OKB: 'okb', OKT: 'oec-token',
  LINK: 'chainlink', UNI: 'uniswap', AAVE: 'aave', GMX: 'gmx', MKR: 'maker', CRV: 'curve-dao-token', LDO: 'lido-dao', PENDLE: 'pendle', ENA: 'ethena', EIGEN: 'eigenlayer',
  HYPE: 'hyperliquid', TAO: 'bittensor', SUI: 'sui', TON: 'the-open-network', TRX: 'tron', XRP: 'ripple', DOGE: 'dogecoin', DOT: 'polkadot', NEAR: 'near', APT: 'aptos', STX: 'blockstack',
  PAXG: 'pax-gold', WLD: 'worldcoin-wld', PYTH: 'pyth-network', JUP: 'jupiter-exchange-solana', JTO: 'jito-governance-token', RAY: 'raydium', RUNE: 'thorchain', ICP: 'internet-computer', KAS: 'kaspa', BCH: 'bitcoin-cash', ETC: 'ethereum-classic',
}

// returns { [denom]: { ...token, geckoId } } for every carbon token that can be priced
async function getCarbonTokenInfo() {
  let gecko = {}
  try {
    gecko = (await get(GECKO_MAP_API)).result.gecko
  } catch (e) {
    sdk.log('carbon: denom_gecko_map unavailable, falling back to the static symbol map')
  }
  const tokenMap = {}
  const size = 500
  for (let skip = 0; ; skip += size) {
    const { tokens = [] } = await get(`${TOKENS_API}?pagination.limit=${size}&pagination.offset=${skip}`)
    for (const token of tokens) {
      const geckoId = gecko[token.denom] ?? symbolToGecko[token.symbol]
      if (!geckoId) continue
      token.geckoId = geckoId
      tokenMap[token.denom] = token
    }
    if (tokens.length < size) break
  }
  return tokenMap
}

module.exports = {
  getCarbonTokenInfo,
}
