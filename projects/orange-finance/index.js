const ADDRESSES = require("../helper/coreAssets.json");

const VAULTS = [
  // app - strategy
  { address: "0xd6ecEb3978bf2b76958b96E8A207246b98C7d639", asset: ADDRESSES.arbitrum.USDC_CIRCLE }, // Camelot USDC-DAI Stable Vault
  { address: "0x0B48540e214bc196e1D0954834876691fE19068D", asset: ADDRESSES.arbitrum.USDC }, // Camelot USDC-USDT Stable Vault
  { address: "0x59671Aa8F4E5adCcb26f4c88F0d6047B0ae7620b", asset: ADDRESSES.arbitrum.USDC }, // Camelot USDC.e-USDC Stable Vault
  // app - lpdfi
  { address: "0xe1B68841E764Cc31be1Eb1e59d156a4ED1217c2C", asset: ADDRESSES.arbitrum.WETH }, // Stryke CLAMM WETH-USDC +-2.5% Automator v2
  { address: "0x5f6D5a7e8eccA2A53C6322a96e9a48907A8284e0", asset: ADDRESSES.arbitrum.WETH }, // Stryke CLAMM WETH-USDC Automator v2
  { address: "0x22dd31a495CafB229131A16C54a8e5b2f43C1162", asset: ADDRESSES.arbitrum.USDC_CIRCLE }, // Stryke CLAMM USDC-WBTC Automator v2
  { address: "0x708790D732c5886D56b0cBBEd7b60ABF47848FaA", asset: ADDRESSES.arbitrum.USDC_CIRCLE }, // Stryke CLAMM USDC-ARB Automator v2
  { address: "0x01E371c500C49beA2fa985334f46A8Dc906253Ea", asset: ADDRESSES.arbitrum.USDC_CIRCLE }, // Stryke CLAMM USDC-WBTC Automator v2
  { address: "0xE32132282D181967960928b77236B3c472d5f396", asset: ADDRESSES.arbitrum.USDC_CIRCLE }, // Stryke CLAMM USDC-ARB Automator v2
  { address: "0x3D2692Bb38686d0Fb9B1FAa2A3e2e5620EF112A9", asset: "0x13A7DeDb7169a17bE92B0E3C7C2315B46f4772B3" }, // Stryke CLAMM BOOP-WETH Automator v2
];

async function tvl(api) {
  const totalAssets = await api.multiCall({ abi: "uint256:totalAssets", calls: VAULTS.map(v => v.address) })

  VAULTS.forEach((v, i) => api.add(v.asset, totalAssets[i]))
}

module.exports = {
  doublecounted: true,
  arbitrum: {
    tvl,
  },
  hallmarks: [
    [1682680200, "Orange Alpha Vault Launch"], //2023 Apr 28
    [1688385600, "Camelot Vault Launch"], //2023 Jul 3
    [1703462400, "Strategy Vault Launch"], //2023 Dec 25
    [1709204400, "LPDfi Vault Launch"], //2024 Feb 29
  ],
};
