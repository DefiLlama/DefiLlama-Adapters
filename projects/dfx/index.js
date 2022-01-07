const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const { GraphQLClient, gql } = require('graphql-request')
const { toUSDTBalances } = require('../helper/balances');
async function getTVL(subgraphName) {
	
	var endpoint = `https://api.thegraph.com/subgraphs/name/dfx-finance/${subgraphName}`;
	var graphQLClient = new GraphQLClient(endpoint)

	var query = gql`
		{
			dfxfactories {
				totalLiquidityUSD
			}
		}
	`;
	const results = await graphQLClient.request(query)

	return results.dfxfactories[0].totalLiquidityUSD
}

async function ethereum() {
	return toUSDTBalances(await getTVL("dfx-v1"))
}

async function polygon() {
	return toUSDTBalances(await getTVL("dfx-v1-polygon"))
}

module.exports = {
	methodology: `DFX TVL is pulled from the DFX subgraph for Eth and Polygon networks.`,
	ethereum:{
		tvl: ethereum
	},
	polygon:{
		tvl: polygon
	},
	tvl: sdk.util.sumChainTvls([ethereum, polygon])
}
