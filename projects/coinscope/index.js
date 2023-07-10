const { tvlByNetwork, poolByNetwork } = require("./helpers");

module.exports = {
  bsc: {
    tvl: tvlByNetwork("bsc"),
    pool2: poolByNetwork("bsc"),
  },
};
