const { compoundExports } = require("../helper/compound");

const maWKAVA = "0x24149e2D0D3F79EBb7Fc464b09e3628dE395b39D";
const unitroller = "0x4804357AcE69330524ceb18F2A647c3c162E1F95";
const wkava = "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b";

module.exports = {
    methodology: "Same as Compound Finance, we just count all the tokens supplied (not borrowed money) on the lending markets",
    kava: compoundExports(unitroller, "optimism", maWKAVA, wkava),
};