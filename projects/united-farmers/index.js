const {calculateUniTvl} = require("../helper/calculateUniTvl");
const {stakingUnknownPricedLP} = require("../helper/staking");

const ufx = "0x44b3efa6c6ca47badb3197b0ab675e4396e40023";
const factory = "0x2fcd5b3b7a5088509babc9910ed2f1b6fe5775b6";
const masterchef = "0x9327B522F6710b858Eb55352f4E52B62B8C2fB26";

async function tvl(timestamp, block, chainBlocks) {
    return await calculateUniTvl(addr=>`bsc:${addr}`, chainBlocks.bsc, "bsc", factory, 0, true);
}

module.exports = {
    bsc: {
        tvl,
        staking: stakingUnknownPricedLP(masterchef, ufx, "bsc", "0xD8d18A4045AdaDEc926E0A3c289E22850993cA7B", addr=>`bsc:${addr}`)
    }
}