const { PublicKey } = require('@solana/web3.js');
const { getConnection } = require('../helper/solana');

async function tvl() {
	const programId = new PublicKey(
		'FoLLukXuiZ5kSq3YWCxEmRUt7yDiE9WJCnh76sdC8RTc'
	);
	const connection = getConnection();

	const accounts = await connection.getProgramAccounts(programId, {
		filters: [{
			dataSize: 88
		}],
		dataSlice: { offset: 0, length: 0 }
	});

	return {
		solana: accounts.reduce((tvl, { account }) => {
			return tvl + account.lamports / 1e9;
		}, 0),
	};
}

module.exports = {
	timetravel: false,
	methodology:
		'To fetch the total supply of deposited SOL into the Follows Program',
	solana: {
		tvl,
	},
};
