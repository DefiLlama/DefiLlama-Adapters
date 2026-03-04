const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs');

const UTOPIA_MINER_CONTRACT = '0x61ea85A817344789d836fbC18B9099bB280b383D';

module.exports = {
	methodology:
		'TVL is calculated as the total BNB balance locked in the Utopia Miner contract.',
	bsc: {
		tvl: sumTokensExport({ owner: UTOPIA_MINER_CONTRACT, token: nullAddress }),
	},
};
