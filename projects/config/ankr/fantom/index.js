const coinAddresses = require("../../../helper/ankr/chainAddresses");

const sdk = require("@defillama/sdk")
const tokenAddresses = require('./tokenAddresses');

const getaFTMbTvl = async () => {
  const { output: totalSupply } = await sdk.api.erc20.totalSupply({ target: tokenAddresses.aFTMb, chain: 'fantom' });
  return { [coinAddresses.ftm]: totalSupply };
};

module.exports = {
  getaFTMbTvl,
};
