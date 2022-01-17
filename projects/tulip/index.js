const { staking } = require('../helper/staking');
const { pool2Exports } = require('../helper/pool2');

const token = "0x9e832CaE5d19e7ff2f0D62881D1E33bb16Ac9bdc";
const petal = "0x2736643C7fFFe186984f60a2d34b91b1b7398bF1";
const garden = "0xceF2f95f185D49bcd1c10DE7f23BEaCBaae6eD0f";
const rewardPool = "0xA6dC92CE76A370854Ed2F76aD753211497B4ba0C";

const pool2LPs = [
    "0x219083f53b3C28e679Aa9F233920c536C01c6ed9", // wROSE-TULIP LP
    "0x48b819c83bC0cBa256d92488b9400199Bc4E5842", // wROSE-PETAL LP
    "0x18d21a2FeCb34b04e1c088Ef842c6dea06F76ac5"  // TULIP-PETAL LP
]

module.exports = {
    oasis: {
        tvl: async () => ({}),
        staking: staking(garden, petal, "oasis"),
        pool2: pool2Exports(rewardPool, pool2LPs, "oasis")
    }
}
