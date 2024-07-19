const { staking } = require("../helper/staking");
const { pool2Exports } = require("../helper/pool2");

const hades = "0x88C37E0bc6a237e96bc4A82774A38BBc30efF3Cf";
const hellshare = "0xEfB15eF34f85632fd1D4C17FC130CcEe3D3D48aE";
const masonry = "0x686A9472B839e8601c81335D0B088b33082BC2f7";
const hellsharerewardpool = "0xcd66208ac05f75069C0f3a345ADf438FB3B53C1A";

const pool2LPs = [
    "0xCD1cc85DC7b4Deef34247CCB5d7C42A58039b1bA", //HELLSHARE-METIS
    "0x586f616Bb811F1b0dFa953FBF6DE3569e7919752" // HADES-METIS
]

module.exports = {
    metis: {
        tvl: async () => ({}),
        staking: staking(masonry, hellshare),
        pool2: pool2Exports(hellsharerewardpool, pool2LPs, "metis")
    }
}