const { pool2 } = require("../helper/pool2");
const { staking } = require("../helper/staking");

const grape = "0x5541D83EFaD1f281571B343977648B75d95cdAC2";
const wine = "0xC55036B5348CfB45a932481744645985010d3A44";
const rewardpool = "0x28c65dcB3a5f0d456624AFF91ca03E4e315beE49";
const boardroom = "0x3ce7bC78a7392197C569504970017B6Eb0d7A972";

const LPTokens = [
    "0x00cB5b42684DA62909665d8151fF80D1567722c3", // WINE-MIM
    "0xb382247667fe8CA5327cA1Fa4835AE77A9907Bc8", // GRAPE-MIM
    "0xd3d477Df7f63A2623464Ff5Be6746981FdeD026F" // GRAPE-WINE
]

module.exports = {
    avax:{
        tvl: async () => ({}),
        pool2: pool2(rewardpool, LPTokens, "avax"),
        staking: staking(boardroom, wine)
    }
}