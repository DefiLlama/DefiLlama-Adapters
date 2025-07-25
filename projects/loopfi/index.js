
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")

// Prelaunch
const LOOP_PRELAUNCH = "0xaBEEcB1d3414550B30694bB37ac24CAaD0b82aE9"
const LOOP_PRELAUNCH_SCROLL = "0x640befeAd1A7ce841ef878058A7003EC260ebAE8"
const LOOP_PRELAUNCH_BTC = "0x497Fb40D610C29E66d06F3B18Cd9966053abB49A"
const LOOP_PRELAUNCH_YNETH = "0xa67C60AE18BE09F074a6c733a1cc06B63Ae53589"

// Loop tokens
const lpETH = "0xa684EAf215ad323452e2B2bF6F817d4aa5C116ab"
const lpUSD = "0x0eecBDbF7331B8a50FCd0Bf2C267Bf47BD876054"
const lpBNB = "0xED166436559Fd3d7f44cb00CACDA96EB999D789e"
const lpBTCB = "0xa02fcc8493856b5bd7fA5099f5a631A6cb77fBd1"

const lpUSDCe = "0x235e49CC709F9e262814795c00eabe73709ef8E2"
const lpXDC = "0xED166436559Fd3d7f44cb00CACDA96EB999D789e"

const tokens = {
  WETH: ADDRESSES.ethereum.WETH,
  weETH: ADDRESSES.ethereum.WEETH,
  ezETH: ADDRESSES.linea.rzETH,
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

const spectraVaultYnETHx = "0x9c5EE26b9623cA864693C575a8fBc8933ae964E7"
const spectraYnETHxLPToken = "0xBc48c48789031A130F957c59e07B7F987aA642dE"

const clisBNBCDPVault = "0x03C07e6d561b664246058974dB31dbF1c1C0B416"
const clisBNBLPToken = "0x1d9D27f0b89181cF1593aC2B36A37B444Eb66bEE"

const ynCoBTCkCDPVault = "0xF0F67671151FF8B9F2117BD3ac7406D9D3ee8f45"
const ynCoBTCkLPToken = "0x132376b153d3cFf94615fe25712DB12CaAADf547"

const spectraUSDVault = "0xbb23b7ACdE2B3A2E6446B16Cd3Dd471b0d80342c"
const spectraUSDLPToken = "0x09d484B738dD85CE3953102453E91507982121d0"

const pendleTETHCDPVault = "0x1438F04666C48957b1D7673684e4a1E505c80aF6"
const pendleTETHLPToken = "0xBDb8F9729d3194f75fD1A3D9bc4FFe0DDe3A404c"

const pendleUniETHCDPVault = "0x7A0734Fa26e188483aae3d4332F19404FEA87832"
const pendleUniETHLPToken = "0xbbA9BAaa6b3107182147A12177e0F1Ec46B8b072"

const pendleRswETHCDPVault = "0x868527fd3Fad53149be0e75eEeaBE4f008D27E81"
const pendleRswETHLPToken = "0xfd5Cf95E8b886aCE955057cA4DC69466e793FBBE"

const pendlePuffETHCDPVault = "0x314A8cB19b5F245C7f109f50F4FaA06cD70C7Aa4"
const pendlePuffETHLPToken = "0x58612beB0e8a126735b19BB222cbC7fC2C162D2a"

const spectraInwstETHCDPVault = "0x03d30243138D45383F02BCA884D42068523bdE22"
const spectraInwstETHLPToken = "0x2cd244f1f9a856c251d276103862dd4325985d2a"

const pendleTETHCDPVault_JAN2026 = "0xb85095c4B18a7d16559A0bFd764F51F0d030587f"
const pendleTETHLPToken_JAN2026 = "0x3DAF20E46708E556570159Eaf98eeE53A1A5b8A4"

const pendleEUSDeCDPVault = "0x16575edcB68613188D70b194b8FD89Df0f6eDFaE"
const pendleEUSDeLPToken = "0xE93B4A93e80BD3065B290394264af5d82422ee70"

const pendleSyrupUSDCVault = "0x18C15607C91C6FC51DB6429e7Fdf5f6165dEED83"
const pendleSyrupUSDCLPToken = "0x9a63fa80b5ddfd3cab23803fdb93ad2c18f3d5aa"

const pendleSUSDfCDPVault = "0x078dbc4815a13acd3c6bb19fcdddb4aefd086137"
const pendleSUSDfLPToken = "0x45f163e583d34b8e276445dd3da9ae077d137d72"


async function tvlEthereum(api) {
  const calls = [lpETH, lpUSD]
  const assets = await api.multiCall({ abi: 'address:asset', calls, })
  const ownerTokens = [
    [Object.values(tokens), LOOP_PRELAUNCH],
    [Object.values(tokensBtc), LOOP_PRELAUNCH_BTC],
    [Object.values(tokensYieldnest), LOOP_PRELAUNCH_YNETH],
    [[spectraLPToken], spectraVault],
    [[spectraUSDLPToken], spectraUSDVault],
    [[spectraYnETHxLPToken], spectraVaultYnETHx],
    [[spectraInwstETHLPToken], spectraInwstETHCDPVault],
    [[pendleTETHLPToken], pendleTETHCDPVault],
    [[pendleUniETHLPToken], pendleUniETHCDPVault],
    [[pendleRswETHLPToken], pendleRswETHCDPVault],
    [[pendlePuffETHLPToken], pendlePuffETHCDPVault],
    [[pendleTETHLPToken_JAN2026], pendleTETHCDPVault_JAN2026],
    [[pendleEUSDeLPToken], pendleEUSDeCDPVault],
    [[pendleSyrupUSDCLPToken], pendleSyrupUSDCVault],
    [[pendleSUSDfLPToken], pendleSUSDfCDPVault]
  ]
  assets.forEach((asset, i) => ownerTokens.push([[asset], calls[i]]))
  return api.sumTokens({ ownerTokens })
}

async function tvlBnb(api) {
  const calls = [lpBNB, lpBTCB]
  const assets = await api.multiCall({ abi: 'address:asset', calls, })
  const ownerTokens = [
  [[clisBNBLPToken], clisBNBCDPVault],
  [[ynCoBTCkLPToken], ynCoBTCkCDPVault]
  ]
  assets.forEach((asset, i) => ownerTokens.push([[asset], calls[i]]))
  return api.sumTokens({ ownerTokens })
}

async function tvlXDC(api) {
  const calls = [lpUSDCe, lpXDC]
  const assets = await api.multiCall({ abi: 'address:asset', calls, })
  const ownerTokens = []
  assets.forEach((asset, i) => ownerTokens.push([[asset], calls[i]]))
  return api.sumTokens({ ownerTokens })
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
  xdc: {
    tvl: tvlXDC
  },
  scroll: {
    tvl: sumTokensExport({
      owner: LOOP_PRELAUNCH_SCROLL,
      tokens: Object.values(tokensScroll),
    })
  }
}
