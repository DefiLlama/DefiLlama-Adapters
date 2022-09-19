const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");

const MAFFIN_HUB = "0x6690384822afF0B65fE0C21a809F187F5c3fcdd8";

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
      "https://api.thegraph.com/subgraphs/name/muffinfi/muffin-mainnet",
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
            params: MAFFIN_HUB,
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
  methodology: `Counts the tokens balances of the MaffinHub contract`,
  ethereum: {
    tvl,
  },
};
