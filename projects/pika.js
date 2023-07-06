const { getBlock } = require('./helper/getBlock')
const sdk = require('@defillama/sdk')

async function tvl(timestamp, block, chainBlocks) {
	block = await getBlock(timestamp, 'optimism', chainBlocks);
	const balance1 = (await sdk.api.erc20.balanceOf({
		target: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
		owner: '0x2FaE8C7Edd26213cA1A88fC57B65352dbe353698',
		block: block,
		chain: 'optimism'
	})).output;
	const balance2 = (await sdk.api.erc20.balanceOf({
		target: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
		owner: '0xD5A8f233CBdDb40368D55C3320644Fb36e597002',
		block: block,
		chain: 'optimism'
	})).output;
	const balance3 = (await sdk.api.erc20.balanceOf({
		target: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
		owner: '0x9b86B2Be8eDB2958089E522Fe0eB7dD5935975AB',
		block: block,
		chain: 'optimism'
	})).output;
	const totalBalance = Number(balance1) + Number(balance2) + Number(balance3);
	return { '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': totalBalance }
};

module.exports = {
	optimism: {
		tvl
	}
}