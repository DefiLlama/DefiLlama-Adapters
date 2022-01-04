const {calculateUniTvl} = require("../helper/calculateUniTvl")

const vultr = "0x8A07A7C25CF225Ed06d5e5Ad253C96D824B588D0";
const masterchef = "0x4AEC2311b365CB5a8434dAAcb205c299d561f82a";
const factory = "0x45523BD2aB7E563E3a0F286be1F766e77546d579";

async function tvl (timestamp, block, chainBlocks) {
    return calculateUniTvl(addr=>`cronos:${addr}`, chainBlocks.cronos, "cronos", factory, 0, true);
}

module.exports = {
    cronos: {
        tvl
    }
}