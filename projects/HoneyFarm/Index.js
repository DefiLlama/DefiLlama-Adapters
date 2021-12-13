const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const { addFundsInMasterChef } = require("../helper/masterchef");
const avaxabi = require("./HoneyBee_Avax_ABI.json");
const bscabi = require("./HoneyBee_BSC_ABI.json");
const polyabi = require("./HoneyBee_Poly_ABI.json");
// const ftmabi = require("./HoneyBee_Fantom_ABI.json");
// const abiGeneral = require("../helper/abis/masterchef.json");
const { default: BigNumber } = require("bignumber.js");

const BEETOKEN = {
	avax: "0xB669c71431bc4372140bC35Aa1962C4B980bA507",
	bsc: "0x1A8d7AC01d21991BF5249A3657C97b2B6d919222",
};

const masterChef = {
	avax: "0x757490104fd4C80195D3C56bee4dc7B1279cCC51",
	bsc: "0x88E21dedEf04cf24AFe1847B0F6927a719AA8F35",
};
const abi = {
	avax: avaxabi,
	bsc: bscabi,
};

// const ACC_BEE_PRECISION = 1e18;

async function getTokensInMasterChef(time, ethBlock, chainBlocks, chain) {
	const block = chainBlocks[chain];
	const transformAddress = (addr) => `${chain}:${addr}`;
	const ignoreAddresses = [BEETOKEN[chain]];

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
// async function fantomTvl(timestamp, block, chainBlocks) {
//	return await getTokensInMasterChef(timestamp, block, chainBlocks, "fantom"); }

async function bscTvl(timestamp, block, chainBlocks) {
  return await getTokensInMasterChef(timestamp, block, chainBlocks, "bsc");
}

// async function polyTvl(timestamp, block, chainBlocks) {
//	return await getTokensInMasterChef(timestamp, block, chainBlocks, "polygon"); }

module.exports = {
	methodology:
		"Only staked LP is counted as TVL. Excluded in TVL : Locked BEE in the RoyalJelly, NFT Jelly, value of BNB & xJOE which aren't on CoinGecko yet.",
	avalanche: {
		tvl: avaxTvl,
	},
	bsc: {
		tvl: bscTvl,
	},
//	polygon: {
//		tvl: polyTvl,	},
//	fantom: {
//		tvl: fantomTvl,	},
	tvl: sdk.util.sumChainTvls([avaxTvl, bscTvl]),
};
