const ADDRESSES = require("../helper/coreAssets.json");

const VAULTS = [
  // alpha
  { address: "0x1c99416c7243563ebEDCBEd91ec8532fF74B9a39", asset: ADDRESSES.arbitrum.USDC }, // UniswapV3 ETH-USDC.e Dynamic Hedge Vault
  { address: "0x16F6617680333e90f18aA89a85817d347078b7b8", asset: ADDRESSES.arbitrum.USDC }, // UniswapV3 ETH-USDC.e DN Vault
  { address: "0x810fd69F58fF7Ff8553D43a5D3DCE3853960cAa6", asset: ADDRESSES.arbitrum.USDC }, // UniswapV3 ETH-USDC.e DN Vault
  { address: "0xb9c5425084671221d7d5a547dbf1bdcec26c8b7d", asset: ADDRESSES.arbitrum.USDC }, // Camelot ETH-USDC.e DN Vault
  // broken { address: "0xdB8a12EeC655748A74576BD8E0acAbdF8e622508", asset: ADDRESSES.arbitrum.USDC_CIRCLE }, // Camelot USDC-USDC.e Stable Vault
  { address: "0x690633417eA231073c53f00D30f194489196dfaD", asset: ADDRESSES.arbitrum.USDC_CIRCLE }, // Camelot USDC-WETH DN Vault
  { address: "0x7B9d8c413ACE4008E22dcF08C3A79A9178682e13", asset: ADDRESSES.arbitrum.WETH }, // Camelot WETH-ARB DN Vault
  { address: "0x32790eAf83B52E53d54bFD4779832d6aDEAC880E", asset: ADDRESSES.arbitrum.WETH }, // UniswapV3 WETH-WBTC DN Vault
  { address: "0x3870eECe85e6CDD013511Afb4ac6A7C4c1688bEa", asset: ADDRESSES.arbitrum.WETH }, // Camelot WETH-USDC.e DN Vault
  // app - strategy
  { address: "0x706b3bcA6d6deD8c61d73270c228f276f4414B5e", asset: ADDRESSES.arbitrum.USDC_CIRCLE }, // Camelot USDC-ARB DN Vault
  { address: "0xF47ecD6514D66A635b2933765Bc7A64895e27139", asset: ADDRESSES.arbitrum.WETH }, // Camelot WETH-ARB DN Vault
  { address: "0xd6ecEb3978bf2b76958b96E8A207246b98C7d639", asset: ADDRESSES.arbitrum.USDC_CIRCLE }, // Camelot USDC-DAI Stable Vault
  { address: "0x2854038d756Aaef87E801d0d617Df5219838bd05", asset: ADDRESSES.arbitrum.USDC_CIRCLE }, // Camelot USDC-WETH DN Vault
  { address: "0x68EC0e9A000c2063b64DC98B8C58d019CCBFb01a", asset: ADDRESSES.arbitrum.WETH }, // Camelot WETH-USDC DN Vault
  { address: "0x0B48540e214bc196e1D0954834876691fE19068D", asset: ADDRESSES.arbitrum.USDC }, // Camelot USDC-USDT Stable Vault
  { address: "0xe4762eAcD41BD6BfB87eCdd3eC815d242b72F4AF", asset: ADDRESSES.arbitrum.WETH }, // Camelot WETH-WBTC DN Vault
  { address: "0xb70671F6b436C755389D3f7a2C61a39296D1ccda", asset: ADDRESSES.arbitrum.WETH }, // Camelot WETH-USDT DN Vault
  { address: "0x59671Aa8F4E5adCcb26f4c88F0d6047B0ae7620b", asset: ADDRESSES.arbitrum.USDC }, // Camelot USDC.e-USDC Stable Vault
  // app - lpdfi
  { address: "0x65Fb7fa8731710b435999cB7d036D689097548e8", asset: ADDRESSES.arbitrum.WETH }, // Stryke CLAMM WETH-USDC +-2.5% Automator v1
  { address: "0xe1B68841E764Cc31be1Eb1e59d156a4ED1217c2C", asset: ADDRESSES.arbitrum.WETH }, // Stryke CLAMM WETH-USDC +-2.5% Automator v2
];

async function tvl(api) {
  const totalAssets = await api.multiCall({ abi: "uint256:totalAssets", calls: VAULTS.map(v => v.address) })

  VAULTS.forEach((v, i) => api.add(v.asset, totalAssets[i]))
}

module.exports = {
  doublecounted: true,
  start: 107356480,
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
