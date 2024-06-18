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
        // BNB
        [ADDRESSES.null, "0x986b40C2618fF295a49AC442c5ec40febB26CC54"],

        //slisBNB
        [
          "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B",
          "0x6F28FeC449dbd2056b76ac666350Af8773E03873",
        ],

        // slisBNB
        [
          "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B",
          "0x91e49983598685DD5ACAc90CEb4061A772f6E5Ae",
        ],

        // eth
        [ADDRESSES.bsc.ETH, "0xA230805C28121cc97B348f8209c79BEBEa3839C0"],

        // eth => wBETH
        [
          "0xa2E3356610840701BDf5611a53974510Ae27E2e1",
          "0xf45C3b619Ee86F653805E007fE211B7e930E0b3B",
        ],

        // wbeth
        [
          "0xa2E3356610840701BDf5611a53974510Ae27E2e1",
          "0xA230805C28121cc97B348f8209c79BEBEa3839C0",
        ],

        // BTCB
        [
          ADDRESSES.bsc.BTCB,
          "0xad9eAAe95617c39019aCC42301a1dCa4ea5b6f65",
        ],
        // ezETH
        [
          ADDRESSES.blast.ezETH,
          "0xd7E33948e2a43e7C1ec2F19937bf5bf8BbF9BaE8",
        ],
        // weETH
        [
          ADDRESSES.blast.weETH,
          "0x2367f2Da6fd39De6944218CC9EC706BCdc9a6918",
        ],
        // STONE
        [
          ADDRESSES.scroll.STONE,
          "0x876cd9a380Ee7712129b52f8293F6f06056c3104",
        ],
      ],
    }),
  },
};
