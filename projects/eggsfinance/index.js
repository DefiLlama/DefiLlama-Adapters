const { nullAddress } = require("../helper/unwrapLPs");

const EGGS_TOKEN_CONTRACT = "0xf26Ff70573ddc8a90Bd7865AF8d7d70B8Ff019bC";


async function borrowed(api) {
  const borrowed = await api.call({ abi: 'uint256:getTotalBorrowed', target: EGGS_TOKEN_CONTRACT, });
  api.addGasToken(borrowed);
}

async function tvl(api) {
  return api.sumTokens({ owner: EGGS_TOKEN_CONTRACT, tokens: [nullAddress] });
}

module.exports = {
  methodology:
    "Calculates the total backing of S in the Eggs contract, and total borrowed in S",
  sonic: {
    tvl,
    borrowed,
  },
};
