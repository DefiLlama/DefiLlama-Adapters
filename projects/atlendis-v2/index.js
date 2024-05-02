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
  const balances = {};
  for (let rcl of rcls) {
    const poolTvl = rcl.tvl - rcl.currentLoan?.borrowedAmount || "0x00";
    if (!balances[`${chain}:${rcl.token.address}`]) {
      balances[`${chain}:${rcl.token.address}`] = poolTvl;
    } else {
      balances[`${chain}:${rcl.token.address}`] =
        balances[`${chain}:${rcl.token.address}`] + poolTvl;
    }
  }
  for (let loan of bulletLoans) {
    const poolTvl = loan.tvl - loan.issuedLoan?.borrowedAmount || "0x00";
    if (!balances[`${chain}:${loan.token.address}`]) {
      balances[`${chain}:${loan.token.address}`] = poolTvl;
    } else {
      balances[`${chain}:${loan.token.address}`] =
        balances[`${chain}:${loan.token.address}`] + poolTvl;
    }
  }
  return balances;
}

async function borrowed(api) {
  const chain = api.chain;
  const graphQLClient = new GraphQLClient(atlendisUrl);
  const chainId = supportedChains[chain];
  const { rcls, bulletLoans } = await graphQLClient.request(query, { chainId });
  const balances = {};
  for (let rcl of rcls) {
    if (rcl.currentLoan) {
      const { borrowedAmount } = rcl.currentLoan;
      if (!balances[`${chain}:${rcl.token.address}`]) {
        balances[`${chain}:${rcl.token.address}`] = borrowedAmount;
      } else {
        balances[`${chain}:${rcl.token.address}`] =
          balances[`${chain}:${rcl.token.address}`] + borrowedAmount;
      }
    }
  }
  for (let loan of bulletLoans) {
    if (loan.issuedLoan) {
      const { borrowedAmount } = loan.issuedLoan;
      if (!balances[`${chain}:${loan.token.address}`]) {
        balances[`${chain}:${loan.token.address}`] = borrowedAmount;
      } else {
        balances[`${chain}:${loan.token.address}`] =
          balances[`${chain}:${loan.token.address}`] + borrowedAmount;
      }
    }
  }
  return balances;
}

module.exports = {
  start: 1686642643,
  hallmarks: [
    [1702367571, "Launch of Fluna V2 Pool on Polygon"],
    [1713855195, "Launch of Arjan pool on Mode Network"],
  ],
};

Object.keys(supportedChains).forEach((chain) => {
  module.exports[chain] = { tvl, borrowed };
});
