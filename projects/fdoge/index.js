const { tombTvl } = require("../helper/tomb");

const token = "0xEb0a2D1b1a33D95204af5d00f65FD9e349419878";
const shares = "0xBda29437C8e5dC8BF6a2305D442A3742da7FB033";
const masonry = "0xDd1Fa691D2fd01FE9206b15350462b712B4AE371";
const rewardPool = "0x5331bE243A6AA35253b8bAe3E12157C6F5B61aDE";
const pool2LPs = [
    "0xd0EE9183F8717819c071bD3BDB77df37B7D4d16B", // FDOGE-WFTM spLP
    "0xbc9eF8F482ACf57CDa927f6Af39f5c513593aDFb", // SDOGE-WFTM spLP
];

module.exports = {
    deadFrom: 1648765747,
    hallmarks: [
        [1645488000, "Rug Pull"]
    ],
    misrepresentedTokens: true,
    ...tombTvl(token, shares, rewardPool, masonry, pool2LPs, "fantom", undefined, false, pool2LPs[1])
}
