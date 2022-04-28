const { aFTMbTokenContract } = require("./contracts");
const coinAddresses = require("../../../helper/ankr/chainAddresses");

const getaFTMbTvl = async () => {
  const totalSupply = await aFTMbTokenContract.methods.totalSupply().call();
  return { [coinAddresses.ftm]: totalSupply };
};

module.exports = {
  getaFTMbTvl,
};
