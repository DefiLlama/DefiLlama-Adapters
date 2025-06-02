const ADDRESSES = require('../helper/coreAssets.json')
const {ohmTvl} = require("../helper/ohm");

const treasury = "0x884f6A98477b0F689f1da280A83a963f2B768972";
const treasuryTokens = [
    [ADDRESSES.polygon.DAI, false], // DAI
    ["0xBdDB96D54E1434654f8E46Dba41120cd652039bb", true] // MAMA-DAI UNI LP
]
const stakingAddress = "0xe1B64E20921a38c20BE98f953F758e9DeD80F89b"
const stakingToken = "0xA9a779aeA33b6f40CfC78A29Cf56Fc7e6fb329AB";

module.exports = {
    misrepresentedTokens: true,
    ...ohmTvl(treasury, treasuryTokens, "polygon", stakingAddress, stakingToken, undefined, undefined, false)
}