const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const erc20 = require("../helper/abis/erc20.json");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { getLatestBlock } = require("@defillama/sdk/build/util/index");
const BN = require("bignumber.js");

// const token = "0x49fB98F9b4a3183Cd88e7a115144fdf00fa6fB95";
const share = "0xD6597AA36DD90d7fCcBd7B8A228F2d5CdC88eAd0";
const rewardPool = "0x44B4a1e8f34Bb52ed39854aD218FF94D2D5b4800";
const scrub = "0x05CaB739FDc0A4CE0642604c78F307C6c543cD6d";
const treasury = "0x101785025A90ae6a865E3161FF37a7483a088ADf";

async function pool2() {

	const { number, timestamp } = await getLatestBlock();

	const balances = {};

	const lpPositions = [];
	let poolInfoReturn = "";
	i = 0;
	do {
		try {
			const token = (
				await sdk.api.abi.call({
					abi: abi.poolInfo,
					target: rewardPool,
					params: i,
					chain: "cronos",
					block: number,
				})
			).output.token;

			const getTokenBalance = (
				await sdk.api.abi.call({
					abi: erc20.balanceOf,
					target: token,
					params: rewardPool,
					chain: "cronos",
					block: number,
				})
			).output;

			lpPositions.push({
				token: token,
				balance: getTokenBalance,
			});
		} catch (error) {
			poolInfoReturn = error.reason;
		}
		i += 1;
	} while (poolInfoReturn != "missing revert data in call exception");

	// console.log(lpPositions)

	await unwrapUniswapLPs(
		balances,
		lpPositions,
		number,
		"cronos",
		(addr) => `cronos:${addr}`
	);

	return balances;
};

async function scrubTvl() {
	const balances = {};
	const { number, timestamp } = await getLatestBlock();

	await sumTokensAndLPsSharedOwners(
		balances,
		[
			["0xD6597AA36DD90d7fCcBd7B8A228F2d5CdC88eAd0", false], // TIGER

		],
		[scrub],
		number,
		"cronos",
		(addr) => `cronos:${addr}`
	);

	return balances;
}

async function getTreasury() {
	const { number, timestamp } = await getLatestBlock();
	let data = await staking(treasury, share, "cronos")(timestamp, undefined, number);
	return data
}

function sumTvl(tvlList = []) {
	return async (...args) => {
		try {
			const results = await Promise.all(tvlList.map((fn) => fn(...args)));
			let accumulator = {};
			results.forEach((c) => {
				Object.keys(c).forEach(x => {
					if (accumulator[x]) {
						accumulator[x] = accumulator[x].plus(new BN(c[x]));
					} else {
						accumulator[x] = new BN(c[x])
					}
				})
			});

			return accumulator
		} catch (err) {
			console.error(err)
		}
	};
}

module.exports = {
	cronos: {
		staking: scrubTvl,
		pool2: pool2,
		tvl: sumTvl([scrubTvl, getTreasury, pool2]),
	},
	methodology: "amount staked on the platform and, the dao treasury",
}