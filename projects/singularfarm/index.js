const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const avaxabi = require("./avaxAbi.json");
const bscabi = require("./bscAbi.json");
const polyabi = require("./polyAbi.json");
const ftmabi = require("./ftmAbi.json");
const abiGeneral = require("../helper/abis/masterchef.json");

const SINGTOKEN = {
	avax: "0xF9A075C9647e91410bF6C402bDF166e1540f67F0",
	bsc: "0x23894C0ce2d79B79Ea33A4D02e67ae843Ef6e563",
	polygon: "0xCB898b0eFb084Df14dd8E018dA37B4d0f06aB26D",
	fantom: "0x53D831e1db0947c74e8a52618f662209ec5dE0cE",
};

const masterChef = {
	avax: "0xF2599B0c7cA1e3c050209f3619F09b6daE002857",
	bsc: "0x31B05a72037E91B86393a0f935fE7094141ba0a7",
	polygon: "0x9762Fe3ef5502dF432de41E7765b0ccC90E02e92",
	fantom: "0x9ED04B13AB6cae27ee397ee16452AdC15d9d561E",
};
const abi = {
	avax: avaxabi,
	bsc: bscabi,
	polygon: polyabi,
	fantom: ftmabi,
};

// const ACC_SING_PRECISION = 1e18;

async function getTokensInMasterChef(time, ethBlock, chainBlocks, chain) {
	const block = chainBlocks[chain];
	const transformAddress = (addr) => `${chain}:${addr}`;
	const ignoreAddresses = [SINGTOKEN[chain]];

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

async function avaxTvl(timestamp, block, chainBlocks) {
	return await getTokensInMasterChef(timestamp, block, chainBlocks, "avax");
}
async function fantomTvl(timestamp, block, chainBlocks) {
	return await getTokensInMasterChef(timestamp, block, chainBlocks, "fantom");
}

async function bscTvl(timestamp, block, chainBlocks) {
	return await getTokensInMasterChef(timestamp, block, chainBlocks, "bsc");
}

async function polyTvl(timestamp, block, chainBlocks) {
	return await getTokensInMasterChef(timestamp, block, chainBlocks, "polygon");
}

module.exports = {
	methodology:
		"Only staked LP is counted as TVL. Excluded in TVL : Locked SING in the bank, meltingpot, value of BNB & xJOE which aren't on CoinGecko yet.",
	avax:{
		tvl: avaxTvl,
	},
	bsc: {
		tvl: bscTvl,
	},
	polygon: {
		tvl: polyTvl,
	},
	fantom: {
		tvl: fantomTvl,
	},
};
