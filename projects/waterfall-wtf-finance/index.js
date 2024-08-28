const sdk = require("@defillama/sdk");
const {pool2Exports} = require("../helper/pool2");
const { staking } = require("../helper/staking");

const token = "0x1811b7eD3B613805A9a4B4b1B80C99d58Af32576";
const shares = "0xF4fA8396E2bae8528Fd5DA5a07Ac8915E1CB6DdA";
const shareRewardPool = "0xE50Ed3b9Eb101397273db82679D27883A69B3A59";
const masonry = "0xa40E3cFEee96B3142c42FB1648Db761eF652dc0F";

const pancakeLPs = [
    "0xbAF461D26f52f627a6F83f8eC474cAc137F42a4F", // WSHARE-WBNB 
    "0x70785cD02d468e335bf9B58DCD3E106a1A43b057" // WTF-BUSD 
]

module.exports = {
    bsc: {
        tvl: async () => ({}),
        staking: staking(masonry, shares),
        pool2: pool2Exports(shareRewardPool, pancakeLPs, "bsc", addr=>`bsc:${addr}`)
    }
}