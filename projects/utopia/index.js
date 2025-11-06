const sdk = require('@defillama/sdk');

const UTOPIA_MINER_CONTRACT = '0x61ea85A817344789d836fbC18B9099bB280b383D';

async function tvl(api) {
	const contractBalance = await sdk.api.eth.getBalance({
		target: UTOPIA_MINER_CONTRACT,
		chain: 'bsc',
	});

	api.addGasToken(contractBalance.output);
}

module.exports = {
	methodology:
		'TVL is calculated as the total BNB balance locked in the Utopia Miner contract.',
	bsc: {
		tvl,
	},
};
