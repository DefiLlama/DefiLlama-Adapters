const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const { addFundsInMasterChef } = require("../helper/masterchef");
const abi = require("./abi.json");
const abiGeneral = require("../helper/abis/masterchef.json");
const { default: BigNumber } = require("bignumber.js");

const SINGTOKEN = "0xF9A075C9647e91410bF6C402bDF166e1540f67F0";

const masterChef = "0xF2599B0c7cA1e3c050209f3619F09b6daE002857";

// const ACC_SING_PRECISION = 1e18;

async function getTokensInMasterChef(time, ethBlock, chainBlocks) {
	const chain = "avax";
	const block = chainBlocks[chain];
	const transformAddress = (addr) => `avax:${addr}`;
	const ignoreAddresses = [SINGTOKEN];

	const balances = {};
	const poolLength = (
		await sdk.api.abi.call({
			abi: abiGeneral.poolLength,
			target: masterChef,
			block,
			chain,
		})
	).output;

	const poolInfo = (
		await sdk.api.abi.multiCall({
			block,
			calls: Array.from(Array(Number(poolLength)).keys()).map((i) => ({
				target: masterChef,
				params: i,
			})),
			abi: abi.poolInfo,
			chain,
		})
	).output;

	const [symbols] = await Promise.all([
		sdk.api.abi.multiCall({
			block,
			calls: poolInfo.map((p) => ({
				target: p.output[0],
			})),
			abi: "erc20:symbol",
			chain,
		}),
	]);

	const lpPositions = [];

	symbols.output.forEach((symbol, idx) => {
		const pool = poolInfo[idx].output;
		const balance = +pool.totalcap;
		const token = symbol.input.target;

		if (symbol.output.includes("LP") || symbol.output.includes("JLP")) {
			lpPositions.push({
				balance,
				token,
			});
		} else {
			sdk.util.sumSingleBalance(balances, transformAddress(token), balance);
		}
	});

	await unwrapUniswapLPs(balances, lpPositions, block, chain, transformAddress);
	return balances;
}

module.exports = {
	methodology: "Only staked LPs are counted as TVL. Excluded in TVL : Locked SING in the bank, meltingpot, value of BNB & xJOE which aren't on CoinGecko yet.",
	tvl: getTokensInMasterChef,
};
