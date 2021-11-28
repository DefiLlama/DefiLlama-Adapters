const { calculateUniTvl } = require("../helper/calculateUniTvl");
const factory = "0x477Ce834Ae6b7aB003cCe4BC4d8697763FF456FA";

async function tvl(timestamp, block, chainBlocks) {
  return calculateUniTvl(
    (addr) => `polygon:${addr}`,
    chainBlocks.polygon,
    "polygon",
    factory,
    0,
    true
  );
}

module.exports = {
  methodology: "TVL are from the pools created by the factory",
  polygon: {
    tvl,
  },
  tvl,
};
