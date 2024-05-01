const { GraphQLClient, } = require("graphql-request");
const query = `
  query tvl($chainId: Int!) {
    rcls(chainId: $chainId) {
      id
     address
      tvl
      token {
        address
      }
      currentLoan {accruedInterests borrowedAmount }
    }
    bulletLoans(chainId: $chainId) {
      id
     address
      tvl
      token {
        address
      }
    }
  }
`

// Atlendis' indexer url
const atlendisUrl = "https://atlendis.herokuapp.com/graphql";
// Atlendis V2 currently supports two chains: Polygon and Mode
const supportedChains = { polygon: 137, mode: 34443 };

async function tvl(api) {
  const chain = api.chain
  const graphQLClient = new GraphQLClient(atlendisUrl);
  const chainId = supportedChains[chain];
  const { rcls, } = await graphQLClient.request(query, { chainId });
  const tokensAndOwners = rcls.map(rcl => [rcl.token.address, rcl.address])
  return api.sumTokens({ tokensAndOwners })
}

async function borrowed(api) {
  const chain = api.chain
  const graphQLClient = new GraphQLClient(atlendisUrl);
  const chainId = supportedChains[chain];
  const { rcls, bulletLoans } = await graphQLClient.request(query, { chainId });

  for (let rcl of rcls) {
    if (rcl.currentLoan) {
      api.add(rcl.token.address, rcl.currentLoan.borrowedAmount)
    }
  }

  for (let loan of bulletLoans) {
    if (loan.issuedLoan) {
      api.add(loan.token.address, loan.tvl)
    }
  }
}

module.exports = {
  start: 1686642643,
  hallmarks: [
    [1702367571, "Launch of Fluna V2 Pool on Polygon"],
    [1713855195, "Launch of Arjan pool on Mode Network"],
  ],
};

Object.keys(supportedChains).forEach(chain => {
  module.exports[chain] = { tvl, borrowed }
})