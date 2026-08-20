const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getHypercoreStakedHype } = require('../helper/chain/hyperliquid')
const { post } = require('../helper/http')

// Treasury wallets tracked by https://portfolio.hyperstrategy.com
const TREASURY = [
  '0xfFaCEA7A016BAefB2fa10F218d7fB07cD023328b',
  '0xbf380f471a368821657bcb556cf9bb3201a1c365',
  '0x3395191428277a4b18f0cebf43135d8923427144',
]

const HSTR = '0x3FA145caD2C8108A68cfc803A8e1aE246C36dF3e'

const TOKENS = [
  ADDRESSES.null, // HYPE
  ADDRESSES.hyperliquid.WHYPE,
  ADDRESSES.hyperliquid.wstHYPE,
  ADDRESSES.hyperliquid.USDT0,
  ADDRESSES.hyperliquid.USDe,
  ADDRESSES.hyperliquid.USDC,
  '0xffaa4a3d97fe9107cef8a3f48c069f577ff76cc1', // stHYPE
  '0xfd739d4e423301ce9385c1fb8850539d657c296d', // kHYPE
  '0x5748ae796ae46a4f1348a1693de4b50560485562', // LHYPE
  '0x4de03ca1f02591b717495cfa19913ad56a2f5858', // hwHYPE
  '0x1359b05241ca5076c9f59605214f4f84114c0de8', // WHLP
  '0x02c6a2fa58cc01a18b8d9e00ea48d65e4df26c70', // feUSD
  '0xbe6727b535545c67d5caa73dea54865b92cf7907', // UETH
  '0x000000000000780555bd0bca3791f89f9542c2d6', // KNTQ
]

// Position managers for the concentrated-liquidity venues the treasury farms on
const V3_POSITION_MANAGERS = [
  '0x6eda206207c09e5428f281761ddc0d300851fbc8', // HyperSwap V3
  '0xead19ae861c29bbb2101e834922b2feee69b9091', // PRJX V3
  '0x934c4f47b2d3ffca0156a45deb3a436202af1efa', // Uniswap V3
  '0xa6bee4100ba2ffd9e202f77fa499a10650583f66', // Uniswap V3
]

const API_URL = 'https://api.hyperliquid.xyz/info'

async function getHypercoreSpotHype(user) {
  const { balances = [] } = await post(API_URL, { type: 'spotClearinghouseState', user })
  const hype = balances.find(b => b.coin === 'HYPE')
  return BigInt(Math.round(+(hype?.total ?? 0) * 1e18))
}

async function tvl(api) {
  await sumTokens2({
    api,
    owners: TREASURY,
    tokens: TOKENS,
    resolveUniV3: true,
    uniV3ExtraConfig: { nftAddress: V3_POSITION_MANAGERS },
    blacklistedTokens: [HSTR],
  })

  for (const owner of TREASURY) {
    api.addGasToken(await getHypercoreStakedHype(owner))
    api.addGasToken(await getHypercoreSpotHype(owner))
  }
}

module.exports = {
  timetravel: false,
  methodology: "Counts the protocol-owned treasury across HyperStrategy's treasury wallets: HYPE and liquid-staked HYPE, stablecoins and other assets held on HyperEVM, concentrated-liquidity LP positions on HyperSwap, PRJX and Uniswap V3, plus HYPE held or staked on HyperCore. HSTR (the protocol's own token) is excluded.",
  hyperliquid: { tvl },
}
