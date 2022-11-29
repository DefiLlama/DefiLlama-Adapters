const { tombTvl } = require("../helper/tomb");

const token = "0xbeBB20cD6364998b8cAfc3d6B86f1ca6363fF910";
const share = "0xBAFDCFC3787BF7833BE6Be8E2D9e822B610255C9";
const rewardPool = "0x9C8C8EB95749dEE9E8cC68f3cAaa658Ea6D1E4bd";
const masonry = "0xA68a020fd0B68A0e4E3F4a97dD44EE3aa0280E7f";
const lps = [
    "0x06378DFab4d97ba1f67EbE68c94893e7fDDf9169",
    "0x6F5CA58FBd1B2f335d1B9489216490fBEDcAda7e"
]

module.exports = {
    ...tombTvl(token, share, rewardPool, masonry, lps, "fantom", undefined, false, lps[1])
}