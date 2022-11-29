const { calculateUniTvl } = require("../helper/calculateUniTvl");
const { staking } = require("../helper/staking");

const factory = "0x965769C9CeA8A7667246058504dcdcDb1E2975A5";
const levin = "0x1698cD22278ef6E7c0DF45a8dEA72EDbeA9E42aa";
const xlevin = "0xafa57Fb9d8D63Ff8124E17c1495C73bc3a7678D0";

async function tvl (timestamp, block, chainBlocks) {
  return await calculateUniTvl(addr=>`xdai:${addr}`, chainBlocks.xdai, "xdai", factory, 0, true);
}

module.exports = {
  xdai: {
    tvl,
    staking: staking(xlevin, levin, "xdai")
  }
}