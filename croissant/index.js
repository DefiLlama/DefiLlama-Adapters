const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { getLatestBlock } = require("@defillama/sdk/build/util/index");

const masterchef = "0x127A5b49E63FadFBA2bc370D44034F170d88C7e6"
const croissant = "0xa0C3c184493f2Fae7d2f2Bd83F195a1c300FA353";
const croi_mmf_lp = "0xde991150329dbe53389db41db459cae3ff220bac";

async function Staking() {
	const balances = {};
	const { number } = await getLatestBlock();
	await sumTokensAndLPsSharedOwners(
		balances,
		[
			[croi_mmf_lp, true],
			[croissant, false],
		],
		[masterchef],
		number,
		"cronos",
		(addr) => `cronos:${addr}`
	);
	return balances;
}

module.exports = {
	misrepresentedTokens: true,
	cronos: {
		staking: Staking,
		tvl: Staking
	},
	methodology: "LPs and tokens in masterchef",
}
