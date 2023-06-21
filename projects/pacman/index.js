const { request, gql } = require('graphql-request');
const BigNumber = require("bignumber.js");

const subgraphUrl = "https://api.thegraph.com/subgraphs/name/pacmanfinance/pacman-arbitrum";

const vaultsQuery = gql`
  query {
    vaults {
      baseToken {
        id
        priceByUsd
      }
      id
      availableAmount
    }
  }
`;

async function tvl(chain) {
  const balances = {};
  const vaultsInfo = await request(subgraphUrl, vaultsQuery);

  for (let i = 0; i < vaultsInfo["vaults"].length; i++) {
    var token = vaultsInfo["vaults"][i]["baseToken"]
    
    balances[`${chain}:${token["id"]}`] = BigNumber(
      balances[`${chain}:${token["id"]}`] || 0
      )
      .plus(
        BigNumber(vaultsInfo["vaults"][i]["availableAmount"])
        .multipliedBy(
        BigNumber(token["priceByUsd"])
        )
      ).toFixed(0)
    ;
  }
  return balances;
}

module.exports = {
  // timetravel: true,
  // misrepresentedTokens: false,
  // methodology: 'get tvl',
  //start: 91889820,
  arbitrum: {
    tvl,
  }
}; 