const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const { getChainTransform } = require("../helper/portedTokens");
const { getFuroTokens, getKashiTokens, getTridentTokens } = require("./helper");

function bentobox(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    const transform = await getChainTransform(chain);

    const tokens = await getTridentTokens(chain);
    console.log(tokens);

    return balances;
  };
}

module.exports = {
  bentobox,
  methodology: `TVL of Sushiswap BentoBox consist of tokens deposited in it minus Trident, Furo and Kashi TVL since they are built on it.`,
};
