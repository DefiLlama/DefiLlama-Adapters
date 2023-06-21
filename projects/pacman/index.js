const { request, gql } = require('graphql-request');
const BigNumber = require("bignumber.js");
const { log } = require("../helper/utils");

const subgraphUrl = "https://api.thegraph.com/subgraphs/name/pacmanfinance/pacman-arbitrum";

const vaultsQuery = gql`
  query {
    vaults {
      baseToken {
        id
        priceByUsd
        decimals
      }
      id
      availableAmount
    }
  }
`;

async function tvl_arbitrum(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  const vaultsInfo = await request(subgraphUrl, vaultsQuery);

  for (let i = 0; i < vaultsInfo["vaults"].length; i++) {
    var token = vaultsInfo["vaults"][i]["baseToken"]

    balances[`arbitrum:${token["id"]}`] = (BigNumber(balances[`arbitrum:${token["id"]}`] || 0)
      .plus (
        (BigNumber(vaultsInfo["vaults"][i]["availableAmount"]))
        // .multipliedBy (
        //   BigNumber(token["priceByUsd"])) 
        .multipliedBy (
          10 ** (token["decimals"]))
      ).toFixed(0)
    );
  }
  
  //console.log(balances)
  return balances;
}

module.exports = {
  // timetravel: true,
  // misrepresentedTokens: false,
  // methodology: 'get tvl',
  //start: 91889820,
  arbitrum: {
    tvl: tvl_arbitrum,
  }
}; 