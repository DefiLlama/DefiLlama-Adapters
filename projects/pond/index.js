const { calculateUniTvl } = require("../helper/calculateUniTvl");

const factory = "0x1d1f1A7280D67246665Bb196F38553b469294f3a";

async function tvl (timestamp, block, chainBlocks) {
    let balances = await calculateUniTvl(addr=> {
        return `fuse:${addr}`
    }, chainBlocks.fuse, "fuse", factory, 0, true);
    return balances
}

module.exports = {
    fuse: {
        tvl
    }
}