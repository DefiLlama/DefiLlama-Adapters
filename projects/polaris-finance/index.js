const { pool2Exports } = require("../helper/pool2");
const { staking, stakings } = require("../helper/staking");

const spolar = "0x9D6fc90b25976E40adaD5A3EdD08af9ed7a21729";
const spolarrewardpool = "0xA5dF6D8D59A7fBDb8a11E23FDa9d11c4103dc49f";
const sunrise = "0xA452f676F109d34665877B7a7B203f2B445D7DE0";

const LPTokens = [
    "0x3fa4d0145a0b6Ad0584B1ad5f61cB490A04d8242", // POLAR-NEAR
    "0xADf9D0C77c70FCb1fDB868F54211288fCE9937DF", // SPOLAR-NEAR
]



module.exports = {
    aurora: {
        tvl: async () => ({}),
        pool2: pool2Exports(spolarrewardpool, LPTokens, "aurora"),
        staking: staking(sunrise, spolar, "aurora"),
    }
}