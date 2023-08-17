const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');

const tokenFarm = '0xBdfbeecF52bCfF5aa8cc1B8A4B737B2Af3D1BA2F';
const tokenFarm2 = '0x8A6AE8076A1866877e006cC9b4bd0378646A9bD5';

const NTToken = '0x8b70512b5248e7c1f0f6996e2fde2e952708c4c9';
const USDTToken = ADDRESSES.heco.USDT;

const bsc_tokenFarm = '0xA05Cbf21620553Ade9a3368f1b20D81eEe74a1FC';
const bsc_tokenFarm2 = '0x973fEAf394F5E882B0F8a9B5CDC0b3E28AA08926';

const bsc_NTToken = '0xfbcf80ed90856AF0d6d9655F746331763EfDb22c';
const bsc_USDTToken = ADDRESSES.bsc.USDT;

async function tvl(timestamp, ethBlock, chainBlocks) {
	let balances = {};

	const USDTBalance = (await sdk.api.abi.call({
		chain: "heco",
		target: USDTToken,
		params: [tokenFarm2],
		abi: 'erc20:balanceOf',
	})).output;
	
	const bsc_USDTBalance = (await sdk.api.abi.call({
		chain: "bsc",
		target: bsc_USDTToken,
		params: [bsc_tokenFarm2],
		abi: 'erc20:balanceOf',
	})).output;

	balances = {};
	balances['heco:'+USDTToken] = USDTBalance;
	balances['bsc:'+bsc_USDTToken] = bsc_USDTBalance;
		
	return balances;
}

async function staking(timestamp, ethBlock, chainBlocks) {
	const NTBalance = (await sdk.api.abi.call({
		chain: "heco",
		target: NTToken,
		params: [tokenFarm2],
		block: chainBlocks.heco,
		abi: 'erc20:balanceOf',
	})).output;

	const bsc_NTBalance = (await sdk.api.abi.call({
		chain: "bsc",
		target: bsc_NTToken,
		params: [bsc_tokenFarm2],
		block: chainBlocks.bsc,
		abi: 'erc20:balanceOf',
	})).output;

	return {
		['heco:'+NTToken]: NTBalance,
		['bsc:'+bsc_NTToken]: bsc_NTBalance,
	}
}


module.exports = {
	methodology: 'TVL counts USDT staked to earn NT tokens and the staking portion of TVL counts the NT tokens that are staked to earn more NT tokens',
	bsc:{
		tvl,
		staking
	},	
}