
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")

// Prelaunch
const LOOP_PRELAUNCH = "0xaBEEcB1d3414550B30694bB37ac24CAaD0b82aE9"
const LOOP_PRELAUNCH_SCROLL = "0x640befeAd1A7ce841ef878058A7003EC260ebAE8"
const LOOP_PRELAUNCH_BTC = "0x497Fb40D610C29E66d06F3B18Cd9966053abB49A"
const LOOP_PRELAUNCH_YNETH = "0xa67C60AE18BE09F074a6c733a1cc06B63Ae53589"

// Loop tokens
const lpETH = "0xa684EAf215ad323452e2B2bF6F817d4aa5C116ab"
const lpBNB = "0xED166436559Fd3d7f44cb00CACDA96EB999D789e"


const tokens = {
  WETH: ADDRESSES.ethereum.WETH,
  weETH: ADDRESSES.ethereum.WEETH,
  ezETH: "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110",
  rsETH: "0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7",
  rswETH: "0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0",
  uniETH: "0xF1376bceF0f78459C0Ed0ba5ddce976F1ddF51F4",
  pufETH: "0xD9A442856C234a39a81a089C06451EBAa4306a72",
}

const tokensScroll = {
  WETH: ADDRESSES.scroll.WETH,
  STONE: ADDRESSES.scroll.STONE,
  weETH: '0x01f0a31698C4d065659b9bdC21B3610292a1c506',
  wrsETH: '0xa25b25548B4C98B0c7d3d27dcA5D5ca743d68b7F',
  pufETH: '0xc4d46E8402F476F269c379677C99F18E22Ea030e',
}

const tokensBtc = {
  WBTC: ADDRESSES.ethereum.WBTC,
  swBTC: '0x8DB2350D78aBc13f5673A411D4700BCF87864dDE'
}

const tokensYieldnest = {
  ynETH: '0x09db87A538BD693E9d08544577d5cCfAA6373A48'
}

const spectraVault = "0x9BfCD3788f923186705259ae70A1192F601BeB47"
const spectraLPToken = "0x2408569177553A427dd6956E1717f2fBE1a96F1D"


async function tvlEthereum(api) {
  const calls = [lpETH]
  const assets = await api.multiCall({ abi: 'address:asset', calls, })
  const ownerTokens = [
    [Object.values(tokens), LOOP_PRELAUNCH],
    [Object.values(tokensBtc), LOOP_PRELAUNCH_BTC],
    [Object.values(tokensYieldnest), LOOP_PRELAUNCH_YNETH],
    [[spectraLPToken], spectraVault],
  ]
  assets.forEach((asset, i) => ownerTokens.push([[asset], calls[i]]))
  return api.sumTokens({ ownerTokens })
}

async function tvlBnb(api) {
  const assets = await api.multiCall({ abi: 'address:asset', calls: [lpBNB] })
  return api.sumTokens({ tokensAndOwners2: [assets, [lpBNB]] })
}

module.exports = {
  methodology:
    "Counts the number of deposited tokens in the Prelaunch Contracts and the tokens provided as collateral in the Loop Protocol",
  start: 1718390875,
  ethereum: {
    tvl: tvlEthereum
  },
  bsc: {
    tvl: tvlBnb
  },
  scroll: {
    tvl: sumTokensExport({
      owner: LOOP_PRELAUNCH_SCROLL,
      tokens: Object.values(tokensScroll),
    })
  }
}
