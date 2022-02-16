const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const erc20 = require("../helper/abis/erc20.json");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { getLatestBlock } = require("@defillama/sdk/build/util/index");
const BN = require("bignumber.js");

// const token = "0x654bAc3eC77d6dB497892478f854cF6e8245DcA9";
const share = "0xf8b9facB7B4410F5703Eb29093302f2933D6E1Aa";
const rewardPool = "0xA51054BDf0910E3cE9B233e6B5BdDc0931b2E2ED";
const masonry = "0x2CcbFD9598116cdF9B94fF734ece9dCaF4c9d471";
const treasury = "0x636B07aE2dB69bD949314F5E2dB65247B5E50bB5";
const dao = "0x0AF5144418a4FE0dB19712A31955513B82108287";
const stakingContracts = ["0x3827CAa33557304e1CA5D89c2f85919Da171C44D", rewardPool]

async function Staking() {
	const balances = {};
	const { number, timestamp } = await getLatestBlock();
	await sumTokensAndLPsSharedOwners(
		balances,
		[
			["0xB6E1705BfAFcf1efEE83C135C0F0210653bAB8F0", true],
			["0xc924da29d37f3b8C62c4c3e4e6958bF2b5ebF677", true],
			["0x97749c9B61F878a880DfE312d2594AE07AEd7656", false],
			["0x50c0C5bda591bc7e89A342A3eD672FB59b3C46a7", false],
			["0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23", false],
			["0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03", false],
		],
		stakingContracts,
		number,
		"cronos",
		(addr) => `cronos:${addr}`
	);

	// console.log(balances)
	return balances;
}

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


	i = 0;
	do {
		try {
			const token = (
				await sdk.api.abi.call({
					abi: abi.poolInfo2,
					target: "0x3827CAa33557304e1CA5D89c2f85919Da171C44D",
					params: i,
					chain: "cronos",
					block: number,
				})
			).output.token;

			const getTokenBalance = (
				await sdk.api.abi.call({
					abi: erc20.balanceOf,
					target: token,
					params: "0x3827CAa33557304e1CA5D89c2f85919Da171C44D",
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

async function cronosTvl() {
	const balances = {};
	const { number, timestamp } = await getLatestBlock();

	await sumTokensAndLPsSharedOwners(
		balances,
		[
			["0xB6E1705BfAFcf1efEE83C135C0F0210653bAB8F0", true],
			["0xc924da29d37f3b8C62c4c3e4e6958bF2b5ebF677", true],
			["0x97749c9B61F878a880DfE312d2594AE07AEd7656", false],
			["0x50c0C5bda591bc7e89A342A3eD672FB59b3C46a7", false],
			["0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23", false],
			["0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03", false],
			["0xf8b9facB7B4410F5703Eb29093302f2933D6E1Aa", false], // MSHARE
			["0x654bac3ec77d6db497892478f854cf6e8245dca9", false], // SVN

		],
		[dao, masonry],
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

module.exports = {
	misrepresentedTokens: true,
	cronos: {
		treasury: getTreasury,
		staking: Staking,
		pool2: pool2,
		tvl: cronosTvl
	},
	methodology: "amount staked on the platform and, the dao treasury",
}