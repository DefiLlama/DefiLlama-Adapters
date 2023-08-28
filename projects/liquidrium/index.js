const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const { vaults } = require('./vaults'); 1

function calculateValue(amount, decimals) {
	return amount / 10 ** decimals;
}
async function tvl(block, chain) {
	let balances = {};

	for (let i = 0; i < vaults.length; i++) {
		if (vaults[i].chain == chain) {
			const poolTVL = await sdk.api.abi.call({
				target: vaults[i].address,
				abi: abi['getTotalAmounts'],
				block: block,
				chain: vaults[i].chain
			});

			const token0Amount = calculateValue(
				poolTVL.output.total0, vaults[i].token1decimal);
			const token1Amount = calculateValue(
				poolTVL.output.total1, vaults[i].token2decimal);

			sdk.util.sumSingleBalance(
				balances, vaults[i].token1Name, token0Amount);
			sdk.util.sumSingleBalance(
				balances, vaults[i].token2Name, token1Amount);
		}
	}

	return balances;
}
async function tvlPolygon(timestamp, block, chainBlocks) {
	return await tvl(chainBlocks['polygon'], 'polygon');
}
async function tvlArbitrum(timestamp, block, chainBlocks) {
	return await tvl(chainBlocks['arbitrum'], 'arbitrum');
}
async function tvlEth(timestamp, block, chainBlocks) {
	return await tvl(block, 'ethereum');
}
module.exports = {
	polygon: {
		tvl: tvlPolygon,
	},
	arbitrum: {
		tvl: tvlArbitrum,
	},
	ethereum: {
		tvl: tvlEth,
	},
	methodology: 'We iterate through each HyperLiquidrium and get the total amounts of each deposited asset, then multiply it by their USD dollar provided by CoinGecko'
};