const { sumTokens2 } = require("../helper/unwrapLPs");

const VAULT = "0x00325d9da832b38179ed2f0dabd4062d93e325a7";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

async function tvl(api) {
  return sumTokens2({
    api,
    tokensAndOwners: [[USDC, VAULT]],
  });
}

module.exports = {
  methodology:
    "TVL is calculated as the total USDC held in the ArcisVault contract, including both reserve and deployed capital across yield strategies.",
  base: {
    tvl,
  },
};
