const { calculateUniTvl } = require("../helper/calculateUniTvl");

const factory = "0xEFD3ad14E5cF09b0EbE435756337fb2e9D10Dc1a";

async function tvl (timestamp, block, chainBlocks) {
  return await calculateUniTvl(addr=>`kava:${addr}`, chainBlocks.kava, "kava", factory, 0, true);
}

module.exports = {
  kava: {
    tvl,
  }
}