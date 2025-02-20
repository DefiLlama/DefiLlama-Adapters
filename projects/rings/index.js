const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");
const { stakings } = require("../helper/staking");

module.exports = {
  methodology: 'TVL counts the tokens deposited in the boring vaults.',
  start: 1733726867
}

const CONFIG = {
  ethereum: {
    vaults: [
      ADDRESSES.sonic.scUSD,
      ADDRESSES.sonic.scETH,
      '0xBb30e76d9Bb2CC9631F7fC5Eb8e87B5Aff32bFbd'
    ],
    supportedAssets: [
      ADDRESSES.ethereum.USDC,                         // USDC
      ADDRESSES.ethereum.USDT,                         // USDT
      ADDRESSES.ethereum.DAI,                          // DAI
      ADDRESSES.ethereum.SDAI,                         // SDAI
      ADDRESSES.ethereum.sUSDS,                        // SUSDS
      ADDRESSES.ethereum.WETH,                         // WETH
      ADDRESSES.ethereum.WSTETH,                       // WSTETH
      ADDRESSES.ethereum.STETH,                       // WSTETH
      ADDRESSES.ethereum.WEETH,                        // WEETH
      ADDRESSES.ethereum.EETH,                        // WEETH
      '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f', // GHO
      '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c', // AAVEUSDC
      '0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a', // AAVEUSDT
      '0x1a88Df1cFe15Af22B3c4c783D4e6F7F9e0C1885d', // STKGHO
      '0xdC035D45d973E3EC169d2276DDab16f1e407384F', // USDS
      '0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8', // AAVEWETH
      '0xd63070114470f685b75B74D60EEc7c1113d33a3D',  // USDO MORPHO,
      '0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB', // STEAK_USDC
      '0x2371e134e3455e0593363cBF89d3b6cf53740618', // GAUNTLET WETH
      ADDRESSES.ethereum.WBTC,
      '0x657e8C867D8B37dCC18fA4Caead9C45EB088C642', // EBTC
      '0x8236a87084f8B84306f72007F36F2618A5634494' // LBTC
    ]
  },
  sonic: {
    vaults: [
      ADDRESSES.sonic.scUSD,
      ADDRESSES.sonic.scETH,
      '0xBb30e76d9Bb2CC9631F7fC5Eb8e87B5Aff32bFbd'
    ],
    supportedAssets: [
      ADDRESSES.sonic.USDC_e,
      '0x50c42dEAcD8Fc9773493ED674b675bE577f2634b', // WETH
      '0x0555E30da8f98308EdB960aa94C0Db47230d2B9c', // WBTC
      '0xecAc9C5F704e954931349Da37F60E39f515c11c1'  // LBTC
    ],
    stakingVaults: [
      '0x4d85ba8c3918359c78ed09581e5bc7578ba932ba',   // stkscUSD
      '0x455d5f11Fea33A8fa9D3e285930b478B6bF85265',   // stkscETH
      '0xD0851030C94433C261B405fEcbf1DEC5E15948d0'    // stkscBTC
    ],
    stakingSupportedAssets: [
      '0xCd4D2b142235D5650fFA6A38787eD0b7d7A51c0C',   // Stable Beets
      '0x33B29bcf17e866A35941e07CbAd54f1807B337f5',   // Stable Beets Gauge
      '0xE54DD58a6d4e04687f2034dd4dDAb49da55F8afF',   // Echoes of the Ether
      '0x8828a6e3166cac78F3C90A5b5bf17618BDAf1Deb',   // Echoes of the Ether Gauge
      '0x0806af1762Bdd85B167825ab1a64E31CF9497038',   //  MEC Capital Euler
    ]
  },
}

Object.keys(CONFIG).forEach((chain) => {
  const {  vaults, supportedAssets,  stakingVaults = [], stakingSupportedAssets = [] } = CONFIG[chain]
  module.exports[chain] = { 
    tvl: sumTokensExport({ owners: vaults, tokens: supportedAssets }),
    staking: sumTokensExport({ owners: stakingVaults, tokens: stakingSupportedAssets, resolveUniV3: true, blacklistedTokens: vaults }),
  };
});