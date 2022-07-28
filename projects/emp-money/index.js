const sdk = require("@defillama/sdk");
const {pool2Exports} = require("../helper/pool2");
const { staking } = require("../helper/staking");

const token = "0x3b248CEfA87F836a4e6f6d6c9b42991b88Dc1d58";
const shares = "0xDB20F6A8665432CE895D724b417f77EcAC956550";
const shareRewardPool = "0x97a68a7949ee30849d273b0c4450314ae26235b1";
const masonry = "0xe9baceea645e8be68a0b63b9764670f97a50942f";

const pancakeLPs = [
    "0x1747AF98EBF0B22d500014c7dd52985d736337d2", // ESHARE-BNB LP 
    "0x84821bb588f049913Dc579Dc511E5e31EB22d5E4" //  EMP-ETH LP
]

module.exports = {
    bsc: {
        tvl: async () => ({}),
        staking: staking(masonry, shares, "bsc"),
        pool2: pool2Exports(shareRewardPool, pancakeLPs, "bsc", addr=>`bsc:${addr}`)
    }
}