const { getConfig } = require('../helper/cache')

const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const multiMerkleStashContracts = "0x378Ba9B73309bE80BF4C2c027aAD799766a7ED5A";
const votiumBribeContract = "0x19BBC3463Dd8d07f55438014b021Fb457EBD4595";

const API_URL =
  "https://raw.githubusercontent.com/oo-00/Votium/main/utils/voteCalculator/tokens.json";

async function ethTvl() {
  const balances = {};

  const tokenAddresses = (await getConfig('Votium', API_URL)).map(
    (addr) => addr.value
  );

  for (const token of tokenAddresses) {
    await sumTokensAndLPsSharedOwners(
      balances,
      [[token, false]],
      [multiMerkleStashContracts, votiumBribeContract],
    );
  }

  return balances;
}

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  methodology: "Counts tvl of Tokens used for Delegating on Convex Snapshot through MultiMerkleStash Contract",
};
