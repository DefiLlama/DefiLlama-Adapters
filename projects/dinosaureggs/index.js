const {calculateUniTvl} = require("../helper/calculateUniTvl");

const factory = "0x73d9f93d53505cb8c4c7f952ae42450d9e859d10";

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  return calculateUniTvl(addr=>`bsc:${addr}`, chainBlocks.bsc, "bsc", factory, 0, true);
};

module.exports = {
  tvl: bscTvl
};
