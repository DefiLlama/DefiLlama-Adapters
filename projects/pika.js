const { getBlock } = require('./helper/getBlock')
const sdk = require('@defillama/sdk')

async function tvl(timestamp, block, chainBlocks) {
	block = await getBlock(timestamp, 'optimism', chainBlocks);
	const balance = (await sdk.api.erc20.balanceOf({
		target: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
		owner: '0x2FaE8C7Edd26213cA1A88fC57B65352dbe353698',
		block: block,
		chain: 'optimism'
	})).output;
	console.log(balance);
	return { '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': balance }
};

module.exports = {
	optimism: {
		tvl
	}
}