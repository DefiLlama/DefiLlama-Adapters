const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");

const graphUrl =
  "https://api.thegraph.com/subgraphs/name/alwaysbegrowing/arbor-v1";

const graphQuery = gql`
  {
    bonds {
      id
      collateralToken {
        id
      }
    }
  }
`;

async function tvl(timestamp, block) {
  const balances = {};

  //graphQL request

  const { bonds } = await request(graphUrl, graphQuery, {});
  const combinedTokensBonds = [];

  //Create array of combined token and bond addresses

  for (let i = 0; i < bonds.length; i++) {
    combinedTokensBonds.push({
      token: bonds[i].collateralToken.id,
      bond: bonds[i].id,
    });
  }

  //Map over array of bonds and tokens to sum the total amount of collateral locked in all bonds

  const getTotalCollateral = await Promise.all(
    combinedTokensBonds.map(async (item) => {
      const collateralBalance = (
        await sdk.api.abi.call({
          abi: "erc20:balanceOf",
          chain: "ethereum",
          target: item.token, //token address (i.e. collateral token; rbn token)
          params: item.bond, //contract address where tokens are stored (i.e. bond address; rbn convertible bond)
          block: block,
        })
      ).output;

      await sdk.util.sumSingleBalance(balances, item.token, collateralBalance);
    })
  );

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "Counts the amount (in USD) of collateral tokens locked for arbor bonds.",
  start: 14913499,
  ethereum: {
    tvl,
  },
};

//node test.js projects/arbor/index.js
