const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");

const KYBORG_HUB = "0x25620d76654caC426229C85bE8eAEB010Ea25c8F";

async function tvl(_, block) {
  const graphQuery = gql`
    query poolQuery {
      tokens {
        id
      }
    }
  `;
  const tokens = (
    await request(
      "https://api.thegraph.com/subgraphs/name/kyborgexchange/kyborgexchange",
      graphQuery
    )
  ).tokens.map(({ id }) => id);

  const tokensBalances = await Promise.all(
    tokens.map(
      async (token) =>
        (
          await sdk.api.abi.call({
            target: token,
            abi: "erc20:balanceOf",
            params: KYBORG_HUB,
            block,
          })
        ).output
    )
  );

  const balances = {};

  tokens.forEach((token, i) => (balances[token] = tokensBalances[i]));
  return balances;
}
module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: `Counts the tokens balances of the KyborgHub contract`,
  arbitrum: {
    tvl,
  },
};