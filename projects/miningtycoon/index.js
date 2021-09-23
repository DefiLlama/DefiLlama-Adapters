const sdk = require('@defillama/sdk');
const erc20Abi = require("../helper/abis/erc20.json");

const tokenFarm = '0xBdfbeecF52bCfF5aa8cc1B8A4B737B2Af3D1BA2F';
const NTToken = '0x8b70512b5248e7c1f0f6996e2fde2e952708c4c9';
const USDTToken = '0xa71edc38d189767582c38a3145b5873052c3e47a';


async function tvl(timestamp, ethBlock, chainBlocks) {
	let balances = {};

	const USDTBalance = (await sdk.api.abi.call({
		chain: "heco",
		target: USDTToken,
		params: [tokenFarm],
		abi: erc20Abi['balanceOf'],
	})).output;
	
	balances = {};
	balances['heco:'+USDTToken] = USDTBalance;
		
	return balances;
}

async function staking(timestamp, ethBlock, chainBlocks) {
	const NTBalance = (await sdk.api.abi.call({
		chain: "heco",
		target: NTToken,
		params: [tokenFarm],
		block: chainBlocks.heco,
		abi: erc20Abi['balanceOf'],
	})).output;

	return {
		['heco:'+NTToken]: NTBalance
	}
}

module.exports = {
	methodology: 'TVL counts USDT staked to earn NT tokens and the staking portion of TVL counts the NT tokens that are staked to earn more NT tokens',
	heco:{
		tvl,
	},
	staking:{
		tvl:staking
	},
	tvl
}