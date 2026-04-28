const { sumTokens2 } = require("../helper/solana");

const STAKING_VAULT = 'ANYxxG365hutGYaTdtUQG8u2hC4dFX9mFHKuzy9ABQJi';

module.exports = {
	timetravel: false,
	solana: {
		tvl: () => ({}),
		staking: () => sumTokens2({ tokenAccounts: [STAKING_VAULT] })
	},
	deadFrom: '2026-02-23', // https://x.com/StepFinance_/status/2025986934112145849
}