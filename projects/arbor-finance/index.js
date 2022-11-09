const { api, util } = require("@defillama/sdk");
const { request, gql } = require("graphql-request");

const graphUrl =
  "https://api.thegraph.com/subgraphs/name/alwaysbegrowing/arbor-v1";

// Get a list of collateral from active bonds at the given block number.
const graphQuery = (block) => gql`
  {
    bonds(where: { state: active }, block: { number: ${block} }) {
      id
      collateralToken {
        id
      }
    }
  }
`;

async function tvl(timestamp, block) {
  const { bonds } = await request(graphUrl, graphQuery(block), {});
  const balances = {};

  // Map over array of bonds and tokens to sum the total amount of collateral locked in all bonds
  await Promise.all(
    bonds.map(async (bond) => {
      const token = bond?.collateralToken?.id;
      const bondAddress = bond?.id;
      if (token == null || bondAddress == null) {
        return;
      }

      const collateralBalance = await api.abi.call({
        abi: "erc20:balanceOf",
        chain: "ethereum",
        target: token, // token address (i.e. collateral token; rbn token)
        params: bondAddress, // contract address where tokens are stored (i.e. bond address; rbn convertible bond)
        block,
      });

      await util.sumSingleBalance(balances, token, collateralBalance?.output);
    })
  );
  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: "Sum the collateral value of active Arbor Finance bonds.",
  start: 14906553,
  ethereum: {
    tvl,
  },
};
