const ADDRESSES = require('../helper/coreAssets.json')

const RWA_STAKING = "0xdbd03d676e1cf3c3b656972f88ed21784372acab"
const RESERVE_STAKING = "0xba0ae7069f94643853fce3b8af7f55acbc11e397"
const SBTC = "0x094c0e36210634c3CfA25DC11B96b562E0b07624"
const STONE = "0x7122985656e38bdc0302db86685bb972b145bd3c"

const nELIXIR = "0x9fbC367B9Bb966a2A537989817A088AFCaFFDC4c"
const inELIXIR = "0xd3bfd6e6187444170a1674c494e55171587b5641"
const nTBILL = "0xe72fe64840f4ef80e3ec73a1c749491b5c938cb9"

const deUSD = ADDRESSES.ethereum.deUSD
const sdeUSD = "0x5C5b196aBE0d54485975D1Ec29617D42D9198326"

const USDC = ADDRESSES.ethereum.USDC
const USDT = ADDRESSES.ethereum.USDT

const USDM = ADDRESSES.ethereum.USDM
const wM = "0x437cc33344a0B27A429f795ff6B469C72698B291"
const M = "0x866A2BF4E572CbcF37D5071A7a58503Bfb36be1b"
const wUSDM = "0x57F5E098CaD7A3D1Eed53991D4d66C45C9AF7812"

const USDC_ARB=ADDRESSES.arbitrum.USDC_CIRCLE
const USDM_ARB=ADDRESSES.ethereum.USDM
const wUSDM_ARB="0x57F5E098CaD7A3D1Eed53991D4d66C45C9AF7812"
const LTF_ARB="0x8c213ee79581Ff4984583C6a801e5263418C4b86"


async function tvl(api) {
  // Get allowed stablecoins from RWA Staking
  const stablecoins = await api.call({    target: RWA_STAKING,    abi: 'address[]:getAllowedStablecoins',  })
  const ownerTokens = [
    [stablecoins, RWA_STAKING], 
    [[SBTC, STONE], RESERVE_STAKING],
    [[deUSD, sdeUSD, USDC, USDT], nELIXIR],
    [[deUSD, sdeUSD, USDC, USDT], inELIXIR],
    [[USDC, wM, M, USDM,wUSDM], nTBILL],
  ]
  return api.sumTokens({ ownerTokens})
}


async function tvl_arbitrum(api) {
  const ownerTokens = [
    [[USDC_ARB, USDM_ARB, wUSDM_ARB, LTF_ARB], nTBILL],
  ]
  return api.sumTokens({ ownerTokens})
}



module.exports = {
  methodology: "Counts total value locked in RWA Staking (stablecoins), Reserve Staking (SBTC and STONE), nELIXIR and nTBILL vault contracts",
  ethereum: { tvl },
  arbitrum: { tvl:tvl_arbitrum }
}