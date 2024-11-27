const { stakings } = require("../helper/staking");
const { sumERC4626VaultsExport } = require("../helper/erc4626");

const UMAMI = "0x1622bf67e6e5747b81866fe0b85178a93c7f86e3";
// UMAMI staking for protocol revenue in WETH
const mUMAMI = "0x2adabd6e8ce3e82f52d9998a7f64a90d294a92a4";
// UMAMI staking from when it was still ohm fork with rebasing mechanics.
// There's still some staked tokens that are yet not unstaked and migrated.
const OHM_STAKING_sUMAMI = "0xc9ecFeF2fac1E38b951B8C5f59294a8366Dfbd81";

// glp vaults are now deprecated as well
const glpVaults = [
  "0x2e2153fd13459eba1f277ab9acd624f045d676ce", 
  "0x727eD4eF04bB2a96Ec77e44C1a91dbB01B605e42",
  "0xbb84D79159D6bBE1DE148Dc82640CaA677e06126",
  "0x6a89FaF99587a12E6bB0351F2fA9006c6Cd12257",
  "0xe0A21a475f8DA0ee7FA5af8C1809D8AC5257607d",
  "0x37c0705A65948EA5e0Ae1aDd13552BCaD7711A23",
]

const gmVaultsArbitrum = [
  "0x959f3807f0Aa7921E18c78B00B2819ba91E52FeF", // gmUSDC
  "0x4bCA8D73561aaEee2D3a584b9F4665310de1dD69", // gmWETH
  "0x5f851F67D24419982EcD7b7765deFD64fBb50a97", // BTC gmUSDC
  "0xcd8011AaB161A75058eAb24e0965BAb0b918aF29", // gmWBTC
];

const gmVaultsAvax = [
  "0x4f3274C3889e6cD54C9c739757Ab8EA4b246D76b", // WETH gmUSDC
  "0xFCE0A462585A422Bac0ca443B102D0ac1Ff20f9e", // gmWETH
];

module.exports = {
  doublecounted: true,
  start: '2022-07-05', // UMAMI deployment block ts
  arbitrum: {
    staking: stakings([mUMAMI, OHM_STAKING_sUMAMI], UMAMI),
    tvl: sumERC4626VaultsExport({ vaults: glpVaults.concat(gmVaultsArbitrum), isOG4626: true }),
  },
  avax: {
    tvl: sumERC4626VaultsExport({ vaults:gmVaultsAvax, isOG4626: true }),
  }
}
