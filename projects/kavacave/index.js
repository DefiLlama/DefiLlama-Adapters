const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const kavaabi = require("./kavaAbi.json");
const abiGeneral = require("../helper/abis/masterchef.json");
const { getFixBalances } = require("../helper/portedTokens");


const masterChef = {
	kava: "0xf17BBB9698b50156Ee437E01e22D7C2080184934"
};
const abi = {
	kava: kavaabi,
};

async function getTokensInMasterChef(time, ethBlock, chainBlocks, chain) {
	const block = chainBlocks[chain];

	const transformAddress = (addr) => `${chain}:${addr}`;
	// const transformAddress=(addr)=>kavaFixMapping[addr];
	const balances = {};
	const poolLength = (
		await sdk.api.abi.call({
			abi: abiGeneral.poolLength,
			target: masterChef[chain],
			block,
			chain,
		})
	).output;
	const poolInfo = (
		await sdk.api.abi.multiCall({
			block,
			calls: Array.from(Array(Number(poolLength)).keys()).map((i) => ({
				target: masterChef[chain],
				params: i,
			})),
			abi: abi[chain].poolInfo,
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
		if (symbol.output.includes("LP") || symbol.output.includes("UNI-V2")) {
			lpPositions.push({
				balance,
				token,
			});
		} else {
			sdk.util.sumSingleBalance(balances, transformAddress(token), balance);
		}
	});

	await unwrapUniswapLPs(balances, lpPositions, block, chain, transformAddress);
	// console.log(balances)
	const fixbalances = await getFixBalances(chain);
	fixbalances(balances);
	return balances;
}

async function kavaTvl(timestamp, block, chainBlocks) {
	return await getTokensInMasterChef(timestamp, block, chainBlocks, "kava");
}

module.exports = {
	hallmarks: [
		[1660521600, "incentives not given"]
	],
	methodology:
		"Staked LP is counted as TVL.",
	kava: {
		tvl: kavaTvl,
	},
};
