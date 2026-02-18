const { staking } = require("../helper/staking");
const { getUniTVL } = require("../helper/unknownTokens");

const leos = "0x2c8368f8F474Ed9aF49b87eAc77061BEb986c2f1";
const leon = "0x27E873bee690C8E161813DE3566E9E18a64b0381";
const factory = "0xEB10f4Fe2A57383215646b4aC0Da70F8EDc69D4F";
const masterchef = "0x72F8fE2489A4d480957d5dF9924166e7a8DDaBBf";

module.exports = {
    misrepresentedTokens: true,
    bsc: {
        tvl: getUniTVL({ factory, useDefaultCoreAssets: true, }),
        staking: staking(masterchef, [leos, leon]),
    },
}