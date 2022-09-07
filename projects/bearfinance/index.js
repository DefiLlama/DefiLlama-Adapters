const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const { transformFantomAddress } = require("../helper/portedTokens");
const {unwrapUniswapLPs} = require("../helper/unwrapLPs");

const MASTER_CHEF = "0x16a06259725e4c7dFcE648f24D3443AfB96Aa0e5"
const BEAR = "0x3b1a7770A8c97dCB21c18a2E18D60eF1B01d6DeC"
const BEAR_DAI_LP = "0x9e5719236e2ce62dc286ac89ae5a0fa142ae3aa8"
const DAI = '0x6b175474e89094c44da98b954eedeac495271d0f';

async function tvl(timestamp, block, chainBlocks) {
	const transformAddress = await transformFantomAddress();

	const [tokenBalances] = await Promise.all([
		sdk.api.abi.multiCall({
			block,
			calls: [
				{
					target: BEAR,
					params: MASTER_CHEF
				}, {
					target: BEAR_DAI_LP,
					params: MASTER_CHEF
				}
			],
			abi: 'erc20:balanceOf',
			chain: 'fantom',
		})
	])

	let balances = {};
	await unwrapUniswapLPs(balances, [{
		balance: tokenBalances.output[1].output,
		token: tokenBalances.output[1].input.target
	}], block, 'fantom', transformAddress);

	const bearInLiquidity = new BigNumber(balances[`fantom:${BEAR.toLowerCase()}`]);
	const daiInLiquidity = new BigNumber(balances[DAI.toLowerCase()]);
	const bearPrice = daiInLiquidity.dividedBy(bearInLiquidity);
	const daiBalanceFromBear = bearInLiquidity.multipliedBy(bearPrice);
	const bearStaked = new BigNumber(tokenBalances.output[0].output);
	const bearStakedInDai = bearStaked.multipliedBy(bearPrice);

	const results = {};

	results[DAI.toLowerCase()] = new BigNumber(daiInLiquidity.plus(daiBalanceFromBear).plus(bearStakedInDai).toFixed(0)).toString(10);

	return results;
}

async function handleStaking(timestamp, _ethBlock, chainBlocks) {
	const [tokenBalances] = await Promise.all([
		sdk.api.abi.multiCall({
			block: chainBlocks['fantom'],
			calls: [
				{
					target: BEAR,
					params: MASTER_CHEF
				}, {
					target: BEAR_DAI_LP,
					params: MASTER_CHEF
				}
			],
			abi: 'erc20:balanceOf',
			chain: 'fantom',
		})
	]);

	const transformAddress = await transformFantomAddress();
	let balances = {};
	await unwrapUniswapLPs(balances, [{
		balance: tokenBalances.output[1].output,
		token: tokenBalances.output[1].input.target
	}], chainBlocks['fantom'], 'fantom', transformAddress);
	const bearInLiquidity = new BigNumber(balances[`fantom:${BEAR.toLowerCase()}`]);
	const daiInLiquidity = new BigNumber(balances[DAI.toLowerCase()]);
	const bearPrice = daiInLiquidity.dividedBy(bearInLiquidity);
	const bearStaked = new BigNumber(tokenBalances.output[0].output);
	const bearStakedInDai = bearStaked.multipliedBy(bearPrice);
	const results = {};
	results[DAI.toLowerCase()] = new BigNumber(daiInLiquidity.plus(bearStakedInDai).toFixed(0)).toString(10);
	return results;
}

async function handlePool2(timestamp, _ethBlock, chainBlocks) {
	const [tokenBalances] = await Promise.all([
		sdk.api.abi.multiCall({
			block: chainBlocks['fantom'],
			calls: [
				{
					target: BEAR,
					params: MASTER_CHEF
				}, {
					target: BEAR_DAI_LP,
					params: MASTER_CHEF
				}
			],
			abi: 'erc20:balanceOf',
			chain: 'fantom',
		})
	]);

	const transformAddress = await transformFantomAddress();
	let balances = {};
	await unwrapUniswapLPs(balances, [{
		balance: tokenBalances.output[1].output,
		token: tokenBalances.output[1].input.target
	}], chainBlocks['fantom'], 'fantom', transformAddress);
	const bearInLiquidity = new BigNumber(balances[`fantom:${BEAR.toLowerCase()}`]);
	const daiInLiquidity = new BigNumber(balances[DAI.toLowerCase()]);
	const bearPrice = daiInLiquidity.dividedBy(bearInLiquidity);
	const daiBalanceFromBear = bearInLiquidity.multipliedBy(bearPrice);
	const results = {};
	results[DAI.toLowerCase()] = new BigNumber(daiInLiquidity.plus(daiBalanceFromBear).toFixed(0)).toString(10);
	return results;
}

module.exports = {
	deadFrom: 1648765747,
	methodology: "TVL includes all farms in MasterChef contract",
	fantom: {
		tvl,
		staking: handleStaking,
		pool2: handlePool2,
	}
}
