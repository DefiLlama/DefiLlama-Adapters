const ADDRESSES = require('../helper/coreAssets.json')
const methodologies = require('../helper/methodologies')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')

// Starlay is an insolvent Aave v2 fork on Astar. Its AddressesProviderRegistry /
// LendingPool are legacy Vyper contracts whose enumeration calls (getReservesList,
// getReserveData, getAllLTokens) now revert on current Astar state after a network
// runtime upgrade, so the shared aave registry helper can't enumerate the market.
// We hardcode the lToken (interest-bearing) -> underlying pairs and report TVL as the
// underlying balances custodied by the lToken contracts (UNDERLYING_ASSET_ADDRESS still
// resolves, balanceOf still works). Borrowed is reported as 0 because the market is
// insolvent.
const LAY = ADDRESSES.astar.LAY
const LAY_STAKING = '0xDf32D28c1BdF25c457E82797316d623C2fcB29C8'

// lToken -> underlying asset
const lTokens = {
  '0xc0043Ad81De6DB53a604e42377290EcfD4Bc5fED': '0xaeaaf0e2c81af264101b9129c00f4440ccf0f720', // lWASTR
  '0xC404E12D3466acCB625c67dbAb2E1a8a457DEf3c': '0x6a2d262d56735dba19dd70682b39f6be9a931d98', // lUSDC
  '0x4dd9c468A44F3FEF662c35c1E9a6108B70415C2c': '0x6de33698e9e9b787e09d3bd7771ef63557e148bb', // lDAI
  '0x430D50963d9635bBef5a2fF27BD0bDDc26ed691F': '0x3795c36e7d12a8c252a20c5a7b455f7c57b60283', // lUSDT
  '0xb7aB962c42A8Bb443e0362f58a5A43814c573FFb': '0x4bf769b05e832fcdc9053fffbc78ca889acb5e1e', // lBUSD
  '0x2308De041865503B3b24F5da4D1ab7308c4ff756': '0x75364d4f779d0bd0facd9a218c67f87dd9aff3b4', // lWSDN
  '0x61f5df7076D2BA75323129CC2724db3abDdC3073': '0x81ecac0d6be0550a00ff064a4f9dd2400585fe9c', // lWETH
  '0xF49Ab32B1B13A50eEe2022347A31a69524E83671': '0xdd90e5e87a2081dcf0391920868ebc2ffb81a1af', // lMATIC
  '0xd37991C23242439B0549c8328df5d83897D645AA': '0x7f27352d5f83db87a5a3e00f4b07cc2138d8ee52', // lBNB
  '0x93E008010B17a48A140EEA4283040adD92eAC576': '0xad543f18cff85c77e140e3e5e3c3392f6ba9d5ca', // lWBTC
  '0x659110D07923e2C3fCB9d3C9E66B0a1605e7ce71': '0xffffffff000000000000000000000001000007c0', // lNativeUSDT
  '0x468Ea96224896B345aA7878AE437DDC169854214': '0xffffffff00000000000000010000000000000008', // lvDOT
  '0x4aaD525895373ad3D8C4aF4743723436312F30e7': '0xffffffff00000000000000010000000000000001', // lAUSD
  '0xc1b06197a4dD1E644d9e58cB91be46CF011b13e8': '0xe511ed88575c57767bafb72bfd10775413e3f2b0', // lnASTR
  // lDOT underlying is the native-token sentinel (0xffff..ff); skipped (not an ERC20 balance).
}

async function tvl(api) {
  const ownerTokens = Object.entries(lTokens).map(([lToken, underlying]) => [[underlying], lToken])
  return sumTokens2({ api, ownerTokens, permitFailure: true })
}

module.exports = {
  methodology: methodologies.lendingMarket,
  astar: {
    tvl,
    borrowed: async () => ({}),  // it is insolvent
    staking: staking(LAY_STAKING, LAY),
  },
}
