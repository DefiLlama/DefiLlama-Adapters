const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unknownTokens");

module.exports = {
  methodology: "count the amount of ankr BNB in the vault",
  hallmarks: [
    [1669939200, "aBNBc exploit"],
    //[1670544000,"aBNBc to AnkrBNB swap & HAY buyback"]
  ],
  bsc: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        // ceaBNBc
        [
          "0x563282106A5B0538f8673c787B3A16D3Cc1DbF1a",
          "0xfA14F330711A2774eC438856BBCf2c9013c2a6a4",
        ],

        // snBNB
        [
          "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B",
          "0x91e49983598685DD5ACAc90CEb4061A772f6E5Ae",
        ],

        // wbeth
        [
          "0xa2E3356610840701BDf5611a53974510Ae27E2e1",
          "0xf45C3b619Ee86F653805E007fE211B7e930E0b3B",
        ],

        // cewBETH
        [
          "0x6C813D1d114d0caBf3F82f9E910BC29fE7f96451",
          "0x5aEfa6309e8Da3eaBd32745aD5B2c9C1EBE54bef",
        ],
      ],
    }),
  },
};
