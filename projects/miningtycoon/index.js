const ADDRESSES = require('../helper/coreAssets.json');
const { staking } = require('../helper/staking');

const tokenFarm2 = '0x8A6AE8076A1866877e006cC9b4bd0378646A9bD5';
const NTToken = '0x8b70512b5248e7c1f0f6996e2fde2e952708c4c9';
const bsc_tokenFarm2 = '0x973fEAf394F5E882B0F8a9B5CDC0b3E28AA08926';
const bsc_NTToken = '0xfbcf80ed90856AF0d6d9655F746331763EfDb22c';


module.exports = {
	methodology: 'TVL counts USDT staked to earn NT tokens and the staking portion of TVL counts the NT tokens that are staked to earn more NT tokens',
	bsc:{
		tvl: staking(bsc_tokenFarm2, ADDRESSES.bsc.USDT),
		staking: staking(bsc_tokenFarm2, bsc_NTToken)
	},	
	heco:{
		tvl: staking(tokenFarm2, ADDRESSES.heco.USDT),
		staking: staking(tokenFarm2, NTToken)
	},	
}