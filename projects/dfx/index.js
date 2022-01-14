const sdk = require('@defillama/sdk');
const { GraphQLClient, gql } = require('graphql-request')
const { toUSDTBalances } = require('../helper/balances');
const { getBlock } = require('../helper/getBlock');

async function getTVL(subgraphName, block) {
	
	block -= 25;
	
	var endpoint = `https://api.thegraph.com/subgraphs/name/dfx-finance/${subgraphName}`;
	var graphQLClient = new GraphQLClient(endpoint)

	var query = gql`
		query get_tvl($block: Int)	{
			dfxfactories(
				block: { number: $block }
			) {
				totalLiquidityUSD
			}
		}
	`;
	
	
	const results = await graphQLClient.request(query, {
		block
	})

	return results.dfxfactories[0].totalLiquidityUSD
}

async function ethereum(timestamp, ethBlock) {
	return toUSDTBalances(await getTVL("dfx-v1", ethBlock))
}

async function polygon(timestamp, ethBlock, chainBlocks) {
	return toUSDTBalances(await getTVL("dfx-v1-polygon",await getBlock(timestamp, "polygon", chainBlocks)))
}

module.exports = {
	timetravel: true,
	methodology: `DFX TVL is pulled from the DFX subgraph for Eth and Polygon networks.`,
	ethereum:{
		tvl: ethereum
	},
	polygon:{
		tvl: polygon
	},
	tvl: sdk.util.sumChainTvls([ethereum, polygon])
}
