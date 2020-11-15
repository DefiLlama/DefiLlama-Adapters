const retry = require('async-retry')
const axios = require("axios");
const { GraphQLClient, gql } = require('graphql-request')
const BigNumber = require("bignumber.js");

async function fetch() {

  let price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,keep-network&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))
  let response = await retry(async bail => await axios.get('https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa&apikey=H6NGIGG7N74TUH8K2X31J1KB65HFBH2E82'))
  var tvl = new BigNumber(response.data.result).div(10 ** 18).toFixed(2);
  tvl = parseFloat(tvl * price_feed.data.bitcoin.usd)
  var q1 =  gql`{
      tokenStakings {
        contractAddress
        totalStaker
        totalTokenStaking
        totalTokenSlash
        members(first: 5, where: {stakingState: STAKED}, orderBy: amount, orderDirection: desc) {
          id
          amount
        }
      }
    }
  `;

  var endpoint = 'https://api.thegraph.com/subgraphs/name/suntzu93/keepnetwork';
  var graphQLClient = new GraphQLClient(endpoint)
  const results = await retry(async bail => await graphQLClient.request(q1))
  var keepStaked = results.tokenStakings[0].totalTokenStaking;
  var totalKeppStaked = (parseFloat(keepStaked) * price_feed.data['keep-network'].usd);
  tvl += totalKeppStaked

  var q2 =  gql`{
  totalBondedECDSAKeeps {
      id
      totalAvailable
      totalBonded
      totalKeepActive
      totalKeepOpened
    }
  }
  `;
  var endpoint = 'https://api.thegraph.com/subgraphs/name/suntzu93/tbtc';
  var graphQLClient = new GraphQLClient(endpoint)
  const results2 = await retry(async bail => await graphQLClient.request(q2))
  var ethStaked = parseFloat(results2.totalBondedECDSAKeeps[0].totalBonded) + parseFloat(results2.totalBondedECDSAKeeps[0].totalAvailable);
  tvl += (parseFloat(ethStaked) * price_feed.data.ethereum.usd)
  return tvl;
}

module.exports = {
  fetch
}
