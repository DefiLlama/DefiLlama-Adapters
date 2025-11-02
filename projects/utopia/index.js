const { abi } = require('./abi');

const UTOPIA_MINER_CONTRACT = '0x61ea85A817344789d836fbC18B9099bB280b383D';

async function tvl(api) {
	const contractBalance = await api.call({
		abi: abi.getBalance,
		target: UTOPIA_MINER_CONTRACT,
	});

	api.addGasToken(contractBalance);
}

module.exports = {
	methodology: 'TVL is calculated as the total BNB balance locked in the Utopia Miner contract.',
	bsc: {
		tvl,
	},
};
