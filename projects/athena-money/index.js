const { tombTvl } = require("../helper/tomb");

const athena = "0x5C2dA48241d3bE9626dd0c48081c76DBb6D1046E";
const ashare = "0xBEcc61601c59d5aFFFE750D201eC98CdC70DB796";
const senate = "0x1Dc0A29e51521E2e9262b91E6E78F4c15A4B7A1a";
const aShareRewardPool = "0x8E57FbcA4191Baf208AfdAe4E7b5591423427f38"; //ashare reward pool


const pool2LPs = [
    "0xc881c93ebb075b3c80f16bc9e513a7784f794ef9",
    "0xc89c09a04440b7952790969ef470f8215bce4804"
]

module.exports = {
    misrepresentedTokens: true,
    ...tombTvl(athena, ashare, aShareRewardPool, senate, pool2LPs, "moonriver", undefined, false, pool2LPs[1])
}
