const { tombTvl } = require("../helper/tomb");

const cream = "0xAE21d31a6494829a9E4B2B291F4984AAE8121757";
const cshare = "0x155f794b56353533E0AfBF76e1B1FC57DFAd5Bd7";
const masonry = "0x13692700791BD876D8f68b5df910339312Efc14b";
const rewardPool = "0x6CD5a7Acbe8Ddc57C8aC2EE72f3f957e26D81f51";
const pool2LPs = [
    "0x00c87ce7188f7652d0c0940274cec5db62f1e825",
    "0xbd61dfad83fc19960476abca1324ffd798234c66",
    "0xec1e129bbaac3dde156643f5d41fc9b5a59033a7"
]

module.exports = {
    ...tombTvl(cream, cshare, rewardPool, masonry, pool2LPs, "avax", undefined, false, "0xbd61dfad83fc19960476abca1324ffd798234c66")
}