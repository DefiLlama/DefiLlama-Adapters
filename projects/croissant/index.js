const { stakings } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");
const masterchef = "0x127A5b49E63FadFBA2bc370D44034F170d88C7e6";
const croissant = "0xa0C3c184493f2Fae7d2f2Bd83F195a1c300FA353";
const croi_mmf_lp = "0xde991150329dbe53389db41db459cae3ff220bac";

module.exports = {
	misrepresentedTokens: true,
	cronos: {
		staking: stakings([masterchef], croissant),
		pool2: pool2s([masterchef], [croi_mmf_lp]),
		tvl: () => ({})
	},
	methodology: "LPs and tokens in masterchef",
};