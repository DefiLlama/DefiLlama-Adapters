const ADDRESSES = require("../helper/coreAssets.json");
const { staking } = require("../helper/staking");
const { sumTokensExport } = require("../helper/unknownTokens");

module.exports = {
    methodology: "The TVL is calculated by summing the values of tokens held in the specified vault addresses",
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
                [ADDRESSES.bsc.BTCB, "0xad9eAAe95617c39019aCC42301a1dCa4ea5b6f65"],
                // ezETH
                [ADDRESSES.blast.ezETH, "0xd7E33948e2a43e7C1ec2F19937bf5bf8BbF9BaE8"],
                // weETH
                [ADDRESSES.blast.weETH, "0x2367f2Da6fd39De6944218CC9EC706BCdc9a6918"],
                // STONE
                [ADDRESSES.scroll.STONE, "0x876cd9a380Ee7712129b52f8293F6f06056c3104"],
                // solvBTC
                [
                    "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7",
                    "0xA94AA72e033b39AD7CD448f38Bc1eda5B52f7079",
                ],
                // BBTC
                [
                    "0xF5e11df1ebCf78b6b6D26E04FF19cD786a1e81dC",
                    "0x157c9a692ee99C39272856055957083a928cE299",
                ],
                // wstETH
                [
                    "0x26c5e01524d2E6280A48F2c50fF6De7e52E9611C",
                    "0xf8Ca8D2B59A97125751af1069d4a5C4F7eB7A677",
                ],
            ],
        }),
        staking: staking('0xd0C380D31DB43CD291E2bbE2Da2fD6dc877b87b3','0xFceB31A79F71AC9CBDCF853519c1b12D379EdC46')
    },
};
