const { GraphQLClient, gql } = require("graphql-request");

// Atlendis' indexer url
const atlendisUrl = "https://atlendis.herokuapp.com/graphql";
// Atlendis V2 currently supports two chains: Polygon and Mode
const supportedChains = { polygon: 137, mode: 34443 };

async function getTvl(chain) {
  const graphQLClient = new GraphQLClient(atlendisUrl);
  const query = gql`
    query tvl($chainId: Int!) {
      rcls(chainId: $chainId) {
        tvl
        token {
          address
        }
      }
      bulletLoans(chainId: $chainId) {
        tvl
        token {
          address
        }
      }
    }
  `;
  const chainId = supportedChains[chain];
  const { rcls, bulletLoans } = await graphQLClient.request(query, { chainId });

  const balances = {};
  for (let pool of [...rcls, ...bulletLoans]) {
    if (!balances[`${chain}:${pool.token.address}`]) {
      balances[`${chain}:${pool.token.address}`] = pool.tvl;
    } else {
      balances[`${chain}:${pool.token.address}`] =
        balances[`${chain}:${pool.token.address}`] + pool.tvl;
    }
  }

  return balances;
}

async function getBorrowed(chain) {
  const graphQLClient = new GraphQLClient(atlendisUrl);
  const query = gql`
    query borrowed($chainId: Int!) {
      rcls(chainId: $chainId) {
        currentLoan {
          borrowedAmount
        }
        token {
          address
        }
      }
      bulletLoans(chainId: $chainId) {
        issuedLoan {
          borrowedAmount
        }
        token {
          address
        }
      }
    }
  `;

  const chainId = supportedChains[chain];
  const { rcls, bulletLoans } = await graphQLClient.request(query, { chainId });

  const balances = {};

  for (let rcl of rcls) {
    if (rcl.currentLoan) {
      if (!balances[`${chain}:${rcl.token.address}`]) {
        balances[`${chain}:${rcl.token.address}`] =
          rcl.currentLoan.borrowedAmount;
      } else {
        balances[`${chain}:${rcl.token.address}`] =
          balances[`${chain}:${rcl.token.address}`] +
          rcl.currentLoan.borrowedAmount;
      }
    }
  }

  for (let loan of bulletLoans) {
    if (loan.issuedLoan) {
      if (!balances[`${chain}:${loan.token.address}`]) {
        balances[`${chain}:${loan.token.address}`] =
          loan.issuedLoan.borrowedAmount;
      } else {
        balances[`${chain}:${loan.token.address}`] =
          balances[`${chain}:${loan.token.address}`] +
          loan.issuedLoan.borrowedAmount;
      }
    }
  }

  return balances;
}

module.exports = {
  start: 1686642643000,
  polygon: {
    tvl: () => getTvl("polygon"),
    borrowed: () => getBorrowed("polygon"),
  },
  mode: {
    tvl: () => getTvl("mode"),
    borrowed: () => getBorrowed("mode"),
  },
  hallmarks: [
    [1702367571, "Launch of Fluna V2 Pool on Polygon"],
    [1713855195, "Launch of Arjan pool on Mode Network"],
  ],
};
