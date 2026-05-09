const olympus = require("../olympus/index");

module.exports = {
  ...olympus,
  ethereum: {
    ...olympus.ethereum,
    tvl: olympus.ethereum.treasuryTvl,
  },
};

delete module.exports.ethereum.staking
delete module.exports.ethereum.borrowed
