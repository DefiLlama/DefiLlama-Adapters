const sdk = require("@defillama/sdk");
const {calculateUniTvl} = require("../helper/calculateUniTvl");

const factory = "0x670f55c6284c629c23baE99F585e3f17E8b9FC31";

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  return calculateUniTvl(addr=>`bsc:${addr}`, chainBlocks.bsc, 'bsc', factory, 0, true);
};

module.exports = {
  tvl: bscTvl,
}
