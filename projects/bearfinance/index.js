const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js");
const { transformFantomAddress } = require("../helper/portedTokens");
const IERC20Abi = require("../helper/abis/erc20.json");
const masterChefAbi = require("../helper/abis/masterchef.json");
const token0Abi = require("../helper/abis/token0.json");
const token1Abi = require("../helper/abis/token1.json");
const {unwrapUniswapLPs} = require("../helper/unwrapLPs");
const { masterChefExports } = require("../helper/masterchef");

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

module.exports = {
	methodology: "TVL includes all farms in MasterChef contract",
	fantom: {
		tvl
	}
}
