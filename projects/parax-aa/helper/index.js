const { gql, request } = require("graphql-request");
const { toUSDTBalances } = require("../../helper/balances");

const AABalanceTVLQuery = gql`
  query RootQuery {
    paraAccountsBalance {
      totalInUSD
      totalInETH
    }
  }
`;

async function tvl() {
  const {
    paraAccountsBalance: { totalInUSD },
  } = await request(
    "https://api.para.space/graphql/ethereum",
    AABalanceTVLQuery
  );

  return toUSDTBalances(totalInUSD);
}

module.exports = {
  tvl,
};