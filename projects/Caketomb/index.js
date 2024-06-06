const {pool2Exports} = require("../helper/pool2");
const { staking } = require("../helper/staking");

const shares = "0x9f8349C33B942b6CBb15426E02b5Bbb77fAeB64f";
const shareRewardPool = "0x02361bAd5b50AfDDea2d8c4359a8C9595445a90D";
const boardroom = "0xcE2912101EF05034Eb2FA818dd6e57Ab09c8Ca73";

const pancakeLPs = [
    "0xdAaf38D37A055F3592f0c86f156Ee8Bff23c1248", // SHARE-WBNB
    "0x252b69d00339D9aAdEEB324dcB6E04381B272340" // CAKETOMB-BNB
]

module.exports = {
    deadFrom: 1648765747,
    bsc: {
        tvl: async () => ({}),
        staking: staking(boardroom, shares),
        pool2: pool2Exports(shareRewardPool, pancakeLPs, "bsc", addr=>`bsc:${addr}`)
    }
}
