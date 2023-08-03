const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const CHAINS = ["boba"];

const Boba_SHIBUI = "0xf08ad7c3f6b1c6843ba027ad54ed8ddb6d71169b";

const Boba_BOBA = ADDRESSES.boba.BOBA;
const Boba_USDT = ADDRESSES.boba.USDT;
const Boba_SHIBUI_WETH = "0xcE9F38532B3d1e00a88e1f3347601dBC632E7a82";
const Boba_SHIBUI_USDT = "0x3f714fe1380ee2204ca499d1d8a171cbdfc39eaa";
const Boba_4Koyo = "0xDAb3Fc342A242AdD09504bea790f9b026Aa1e709";

const CHAIN_ORGANISED_DATA = {
  boba: () => {

    return [
      {
        treasuryTokens: [
          [Boba_BOBA, false],
          [Boba_USDT, false],
          [Boba_SHIBUI_WETH, true],
          [Boba_SHIBUI_USDT, true],
        ],
        treasuryKoyoTokens: [Boba_4Koyo],
        treasuryAddresses: [
          "0x9596E01Ad72d2B0fF13fe473cfcc48D3e4BB0f70", // Hot treasury
        ],
        gaugeTokens: [Boba_SHIBUI_USDT],
        gaugeAddresses: [
          "0x6b8f4Fa6E44e923f5A995A87e4d79B3Bb9f8aaa3", // SHIBUI-USDT<>WAGMIv3
        ],
      },
      true,
    ];
  },
};

module.exports = {
  start: 394825,

  boba: {
    tvl: async (timestamp, _ethBlock, chainBlocks) => {
      const chain = CHAINS[0];
      const [data, koyoAssets] = CHAIN_ORGANISED_DATA[chain]();

      const balances = {};
      const block = chainBlocks[chain];

      await sumTokensAndLPsSharedOwners(
        balances,
        data.treasuryTokens,
        data.treasuryAddresses,
        block,
        chain
      );

      return balances;
    },
  },
}
