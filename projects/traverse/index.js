const {ohmTvl} = require("../helper/ohm");

const verse = "0xB72ab6f7177bBb41eFcC17D817778d77460259F1";
const staking = "0x3fb7931f7BFA9f318Fbf2346f568802a76531774";

const treasury = "0x50862E119a56ff41c6d660128e072ADd7dEc837b"
const treasuryTokens = [
    ["0xd586e7f844cea2f87f50152665bcbc2c279d8d70", false] // DAI
]
module.exports = {
    ...ohmTvl(treasury, treasuryTokens, "avax", staking, verse)
}