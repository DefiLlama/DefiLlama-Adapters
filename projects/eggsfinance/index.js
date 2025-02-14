const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const EGGS_TOKEN_CONTRACT = "0xf26Ff70573ddc8a90Bd7865AF8d7d70B8Ff019bC";

async function tvl(time, ethBlock, _b, {api}) {
  return sumTokens2({ tokens: [nullAddress], owner: EGGS_TOKEN_CONTRACT, api })
}

module.exports = {
  methodology:
    "Calculates the total backing of S in the Eggs contract",
  sonic: {
    tvl,
  },
};
