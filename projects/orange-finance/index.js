const ADDRESSES = require("../helper/coreAssets.json");

const VAULTS = [
  "0xb9c5425084671221d7d5a547dbf1bdcec26c8b7d", //Camelot ETH-USDC.e DN Vault
  "0x1c99416c7243563ebEDCBEd91ec8532fF74B9a39", //UniswapV3 ETH-USDC.e Dynamic Hedge Vault
];

async function tvl(api) {
  const totalAssets = await api.multiCall({ abi: "uint256:totalAssets", calls: VAULTS })

  totalAssets.forEach((i) => api.add(ADDRESSES.arbitrum.USDC, i))
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
  ],
};
