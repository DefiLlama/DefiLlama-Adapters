const { tombTvl } = require("../helper/tomb");

const peel = "0xec734dbb16acc25542d8714fe29ccb401d8f6e17";
const pshare = "0x5cbf7cf618a0f6e4b2792f3599faabfc6a6a8ba7";
const rewardPool = "0xd5bf19f54ad07b01a01d70b45014dd9fc3d64f93";
const masonry = "0x16cea11b090e99d108011e8598e67c0fa2f5508b";

const lps = [
    "0x025b858acf3d7b07fed07624d09550c4abc9ee40",
    "0xf9d03e5ddbc88e687264d9e98f94d09fbd6469d5",
];

module.exports = {
    misrepresentedTokens: true,
    ...tombTvl(peel, pshare, rewardPool, masonry, lps, "bsc", undefined, false, lps[1])
}