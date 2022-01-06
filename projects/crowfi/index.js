const {calculateUniTvl} = require("../helper/calculateUniTvl");

const crow = "0x285c3329930a3fd3C7c14bC041d3E50e165b1517";
const factory = "0xDdcf30c1A85e5a60d85310d6b0D3952A75a00db4"

const translate = {
    "0xfa9343c3897324496a05fc75abed6bac29f8a40f": "bsc:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c", // BNB
}

async function tvl (timestamp, block, chainBlocks) {
    return await calculateUniTvl(addr=> {
        addr = addr.toLowerCase()
        if (translate[addr] !== undefined) {
            return translate[addr];
        }
        return `cronos:${addr}`
    }, chainBlocks.cronos, "cronos", factory, 0, true);
}

module.exports = {
    methodology: "TVL in factory contract",
    cronos: {
        tvl
    }
}