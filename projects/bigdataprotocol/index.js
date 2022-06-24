const sdk = require("@defillama/sdk");
const { GraphQLClient, gql } = require('graphql-request');
const retry = require('../helper/retry');
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { addFundsInMasterChef } = require("../helper/masterchef");

const BDPMasterContract = "0x0De845955E2bF089012F682fE9bC81dD5f11B372";
const BDP = "0xf3dcbc6d72a4e1892f7917b7c43b74131df8480e";

const endpoint = 'https://subgraph.mainnet.bigdataprotocolmarket.com:8000/subgraphs/name/oceanprotocol/ocean-subgraph'


const ethTvl = async (chainBlocks) => {
  const balances = {};

  /*** BDP Seed Pools (Data Vault seccion) TVL portion ***/
  await addFundsInMasterChef(
    balances,
    BDPMasterContract,
    chainBlocks["ethereum"],
    "ethereum",
    addr => addr,
    abi.poolInfo,
  );

  /*** BDP Data Set Pools (Data Market seccion) TVL portion ***/
  const graphQLClient = new GraphQLClient(endpoint);

  const query = gql`{
    poolFactories{
      totalValueLocked
    }
  }`;


  const tvlInBDP = (await retry(
    async bail => await graphQLClient.request(query))).poolFactories.map(tvl => tvl.totalValueLocked);

  sdk.util.sumSingleBalance(balances, 'big-data-protocol', +tvlInBDP[0]);

  return balances;
};

module.exports = {
  ethereum: {
    staking: staking(BDPMasterContract, BDP),
    tvl: ethTvl,
  },
  methodology: `Counts liquidity on the Pools of Data Vault and Data Market seccions through BDPMaster Contract
  and using Subgraph API 'https://subgraph.mainnet.bigdataprotocolmarket.com:8000/subgraphs/name/oceanprotocol/ocean-subgraph'
  to pulling data`
}