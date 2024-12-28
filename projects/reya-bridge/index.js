const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  ethereum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xdff78a949e47c1e90f3dd6dd7fe2fa72b42a75f7", // usdc vault
          "0x64df894688c5052beadc35371cf69151ebc5d658", // eth vault
        ],
        tokens: [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.WETH, nullAddress],
      }),
  },
  optimism: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x9239609eED7c40C6DDcEC25D247Ef205103590B6", // usdc vault
          "0xAd7bdD85fdA879fe7771A2546939972F202C1BaE", // eth vault
          "0xCbEcd69ceFA64F55b72F8ac288FC5c452819B608" // usdc vault 2
        ],
        tokens: [ADDRESSES.optimism.USDC, ADDRESSES.optimism.WETH, ADDRESSES.optimism.USDC_CIRCLE],
      }),
  },
  polygon: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xC0acBb471465FCf848746D1837d8358aB891546c", // usdc vault
          "0x72384be7092144cD9a57526B486827E4eA632351", // eth vault
          "0xBC31ec84bd7BC2c97B9413F6E473cE96Be153a25" // usdc vault 2
        ],
        tokens: [ADDRESSES.polygon.USDC, ADDRESSES.polygon.WETH, ADDRESSES.polygon.USDC_CIRCLE],
      }),
  },
  base: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0x77e61C6fcAEe80CA578B818DD583d2b78f99289C", // dai vault
          "0x2b3A8ABa1E055e879594cB2767259e80441E0497", // eth vault
          "0xd71629697b71e2df26b4194f43f6eaed3b367ac0", //usdc real vault
        ],
        tokens: [ADDRESSES.base.USDC, ADDRESSES.base.WETH, ADDRESSES.base.DAI],
      }),
  },
  arbitrum: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: [
          "0xa0E9B6DA89BD0303A8163B81B8702388bE0Fde77", // usdc vault
          "0xD7BBE2f6D1B52A27D2dAC28298DE3974a3d13047", // eth vault
          "0x11B3a7E08Eb2FdEa2745e4CB64648b10B28524A8" //  usdc vault 2
        ],
        tokens: [ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.WETH, ADDRESSES.arbitrum.USDC_CIRCLE],
      }),
  },
};
