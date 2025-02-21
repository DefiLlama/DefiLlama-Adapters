const { nullAddress } = require("../helper/unwrapLPs");

const BATLAS_TOKEN_CONTRACT = "0x5E571727c7aD0c062D009F0Fe7c17f93a02da158";


async function borrowed(api) {
  const borrowed = await api.call({ abi: 'uint256:getTotalBorrowed', target: BATLAS_TOKEN_CONTRACT, });
  api.addGasToken(borrowed);
}

async function tvl(api) {
  return api.sumTokens({ owner: BATLAS_TOKEN_CONTRACT, tokens: [nullAddress] });
}

module.exports = {
  methodology:
    "Calculates the total backing of Bera in the Batlas contract, and total borrowed in Bera",
  berachain: {
    tvl,
    borrowed,
  },
};