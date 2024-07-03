const { sumTokens2 } = require("../helper/solana");

const STEP_MINT = 'StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT';
const STAKING_VAULT = 'ANYxxG365hutGYaTdtUQG8u2hC4dFX9mFHKuzy9ABQJi';

module.exports = {
	timetravel: false,
	solana: {
		tvl,
		staking: () => sumTokens2({ tokenAccounts: [STAKING_VAULT] })
	},
};

async function tvl(api) {
	const tokensAndOwners = [[STEP_MINT, STAKING_VAULT]];
	return sumTokens2({ tokensAndOwners });
}