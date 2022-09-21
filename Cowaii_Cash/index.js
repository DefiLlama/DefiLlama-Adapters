const sdk = require("@defillama/sdk");
const {pool2Exports} = require("../helper/pool2");
const { staking } = require("../helper/staking");

const token = "0xB483CbF402eF2B07060544e4aA4c5690fea32B12";
const shares = "0xc90163b8d53F319AbE68dd1d8ecC025c72eB3f04";
const shareRewardPool = "0xb015d1D4F846D44A699F5648071496D1eC99C4C5";
const masonry = "0x0eD8cFA5Bd631263CFAb290E12e2559af1252Ed6";

const pancakeLPs = [
    "0x77A86d9c3A7689cD6577a6FC433a19f7c1686198", // MILK-WWDOGE LP 
    "0xe0d79F5Bc8e86E9123cA14937ca791128D013130" // COWAII-WWDOGE LP
]

module.exports = {
    DC: {
        tvl: async () => ({}),
        staking: staking(masonry, shares, "DC"),
        pool2: pool2Exports(shareRewardPool, pancakeLPs, "DC", addr=>`bsc:${addr}`)
    }
}