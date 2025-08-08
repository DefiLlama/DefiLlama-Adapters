const { GraphQLClient } = require("graphql-request");
const query = `
  query tvlAndBorrow($chainId: Int!) {
    rcls(chainId: $chainId) {
      address
      tvl
      token {
        address
      }
      currentLoan {
        borrowedAmount
      }
    }
    bulletLoans(chainId: $chainId) {
      address
      tvl
      token {
        address
      }
      issuedLoan {
        borrowedAmount
      }
    }
  }
`;

// Atlendis' indexer url
const atlendisUrl = "https://atlendis.herokuapp.com/graphql";
// Atlendis V2 currently supports two chains: Polygon and Mode
const supportedChains = { polygon: 137, mode: 34443 };

async function tvl(api) {
  const chain = api.chain;
  const graphQLClient = new GraphQLClient(atlendisUrl);
  const chainId = supportedChains[chain];
  const { rcls, bulletLoans } = await graphQLClient.request(query, { chainId });
  const tokensAndOwners = [...rcls, ...bulletLoans].map((pool) => [
    pool.token.address,
    pool.address,
  ]);
  return api.sumTokens({ tokensAndOwners });
}

async function borrowed(api) {
  const chain = api.chain;
  const graphQLClient = new GraphQLClient(atlendisUrl);
  const chainId = supportedChains[chain];
  const { rcls, bulletLoans } = await graphQLClient.request(query, {
    chainId,
  });
  for (let rcl of rcls) {
    if (rcl.currentLoan) {
      const { borrowedAmount } = rcl.currentLoan;
      api.add(rcl.token.address, borrowedAmount);
    }
  }
  for (let loan of bulletLoans) {
    if (loan.issuedLoan) {
      const { borrowedAmount } = loan.issuedLoan;
      api.add(loan.token.address, borrowedAmount);
    }
  }
}

module.exports = {
  start: '2023-06-13',
  hallmarks: [
    [1702367571, "Launch of Fluna V2 Pool on Polygon"],
    [1713855195, "Launch of Arjan pool on Mode Network"],
  ],
};

Object.keys(supportedChains).forEach((chain) => {
  module.exports[chain] = { tvl, borrowed };
});
