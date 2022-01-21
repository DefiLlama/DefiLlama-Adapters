const { staking } = require("../helper/staking");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const love = "0x9505dbD77DaCD1F6C89F101b98522D4b871d88C5";
const dao = "0x650eC6f59b64AcAC97A33C1F2F34c646659FF8b4"
const loveStaking = "0x31dd9Be51cC7A96359cAaE6Cb4f5583C89D81985"
const treasury = "0x631Fb1f772b8A20e775D1d4F3F87BfCaBA317527";
const treasuryTokens = [
	["0xe9e7cea3dedca5984780bafc599bd69add087d56", false], // BUSD
	["0x9e8Ae3a26536582823Ef82c155B69637a4A753F8", true], // LOVE-BUSD Cake-LP
	["0x55d398326f99059fF775485246999027B3197955", false], // USDT
	["0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", false], // WBNB
	["0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82", false], // CAKE
	["0x565b72163f17849832a692a3c5928cc502f46d69", false], // HUNNY
]

async function tvl(timestamp, ethBlock, chainBlocks) {
	const balances = {};

	const transform = addr => `bsc:${addr}`;

	await sumTokensAndLPsSharedOwners(
		balances,
		treasuryTokens,
		[treasury],
		chainBlocks.bsc,
		'bsc',
		transform
	);

	return balances;
}

module.exports = {
	bsc: {
		tvl: tvl,
		staking: staking(loveStaking, love, 'bsc')
	}
}
