const ADDRESSES = require("../helper/coreAssets.json");
const mainContract = "0x2Fc617E933a52713247CE25730f6695920B3befe";

module.exports = {
  chains: [
    {
      name: "ethereum",
      tokens: [
        ADDRESSES.null,
        "0xBBbbCA6A901c926F240b89EacB641d8Aec7AEafD",
        "0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF",
        ADDRESSES.ethereum.SNX,
        ADDRESSES.ethereum.USDC,
        "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
        ADDRESSES.ethereum.USDT,
      ],
      holders: [mainContract],
    },
    {
      name: "bsc",
      tokens: [
        ADDRESSES.null,
        ADDRESSES.bsc.ETH,
        "0x66e4d38b20173F509A1fF5d82866949e4fE898da",
        ADDRESSES.bsc.USDC,
        "0x9Ac983826058b8a9C7Aa1C9171441191232E8404",
        ADDRESSES.bsc.BUSD,
        ADDRESSES.bsc.BETH,
        ADDRESSES.bsc.BTCB,
      ],
      holders: [mainContract],
    },
    {
      name: "avax",
      tokens: [
        ADDRESSES.null,
        ADDRESSES.avax.WETH_e,
        ADDRESSES.avax.USDC,
        ADDRESSES.avax.USDC_e,
      ],
      holders: [mainContract],
    },
    {
      name: "polygon",
      tokens: [
        ADDRESSES.null,
        ADDRESSES.polygon.WETH_1,
        ADDRESSES.polygon.USDC,
        "0x50B728D8D964fd00C2d0AAD81718b71311feF68a",
      ],
      holders: [mainContract],
    },
    {
      name: "era",
      tokens: [ADDRESSES.era.USDC, ADDRESSES.null],
      holders: [mainContract],
    },
    {
      name: "arbitrum",
      tokens: [
        ADDRESSES.null,
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.USDC_CIRCLE,
        "0x95146881b86B3ee99e63705eC87AfE29Fcc044D9",
      ],
      holders: [mainContract],
    },
    {
      name: "optimism",
      tokens: [
        ADDRESSES.null,
        "0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4",
        ADDRESSES.optimism.USDC,
        ADDRESSES.optimism.OP,
        ADDRESSES.optimism.USDC_CIRCLE,
      ],
      holders: [mainContract],
    },
    {
      name: "base",
      tokens: [ADDRESSES.null, ADDRESSES.base.USDbC, ADDRESSES.base.USDC],
      holders: [mainContract],
    },
    {
      name: "imx",
      tokens: [ADDRESSES.null],
      holders: [mainContract],
    },
  ],
};
