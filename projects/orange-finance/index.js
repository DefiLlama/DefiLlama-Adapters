const ADDRESSES = require("../helper/coreAssets.json");
const sdk = require("@defillama/sdk");

const VAULTS = [
  "0xb9c5425084671221d7d5a547dbf1bdcec26c8b7d", //Camelot ETH-USDC.e DN Vault
  "0x1c99416c7243563ebEDCBEd91ec8532fF74B9a39", //UniswapV3 ETH-USDC.e Dynamic Hedge Vault
];
const USDC_ARB = ADDRESSES.arbitrum.USDC;

async function tvl(_, _1, _2, { api }) {
  const totalAssets = (
    await sdk.api.abi.multiCall({
      abi: "function totalAssets() external view returns (uint256)",
      calls: VAULTS.map((addr) => ({ target: addr })),
      chain: "arbitrum",
    })
  ).output;

  totalAssets.forEach((totalAsset) => {
    api.add(USDC_ARB, totalAsset.output);
  });
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "",
  start: 107356480,
  arbitrum: {
    tvl,
  },
  hallmarks: [
    [1682680200, "Orange Alpha Vault Launch"], //2023 Apr 28
    [1688385600, "Camelot Vault Launch"], //2023 Jul 3
  ],
};
