const sdk = require("@defillama/sdk");
const {pool2Exports} = require("../helper/pool2");
const { staking } = require("../helper/staking");

const token = "0x522348779DCb2911539e76A1042aA922F9C47Ee3";
const shares = "0x531780FAcE85306877D7e1F05d713D1B50a37F7A";
const shareRewardPool = "0x1083926054069AaD75d7238E9B809b0eF9d94e5B";
const masonry = "0xcAF7D9CE563E361A304FB6196499c1Dfd11b5991";

const pancakeLPs = [
    "0x1303246855b5B5EbC71F049Fdb607494e97218f8", // BSHARE-WBNB 
    "0x84392649eb0bC1c1532F2180E58Bae4E1dAbd8D6" // BOMB-BTCB 
]

module.exports = {
    bsc: {
        tvl: async () => ({}),
        staking: staking(masonry, shares),
        pool2: pool2Exports(shareRewardPool, pancakeLPs, "bsc", addr=>`bsc:${addr}`)
    }
}