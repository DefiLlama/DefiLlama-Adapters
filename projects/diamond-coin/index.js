const sdk = require("@defillama/sdk");
const {pool2} = require("../helper/pool2");

const token = "0xDDa0F0E1081b8d64aB1D64621eb2679F93086705";
const emissionRewardPool = "0xDDa0F0E1081b8d64aB1D64621eb2679F93086705";

const DiamondLPs = [
    "0xf5e8B220843EC7114B91AfF0D25342c24eB953b5", // DIAMOND-FTM 
    "0x2f1569094CB256fB745901fa92e57aF011D32B2C" // BOMB-DIAMOND 
]

module.exports = {
    fantom: {
        tvl: async () => ({}),
        pool2: pool2(emissionRewardPool, DiamondLPs, "fantom", addr=>`fantom:${addr}`)
    }
}
