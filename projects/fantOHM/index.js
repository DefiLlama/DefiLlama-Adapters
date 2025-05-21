const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");
const { sumTokensExport } = require("../helper/unwrapLPs");

const fantomFhm = "0xfa1FBb8Ef55A4855E5688C0eE13aC3f202486286";
const fantomStaking = "0xcb9297425C889A7CbBaa5d3DB97bAb4Ea54829c2";
const moonriverFhm = "0xfa1FBb8Ef55A4855E5688C0eE13aC3f202486286";
const moonriverStaking = "0xF5C7D63C5Fc0aD4b7Cef7d8904239860725Ebc87";

// addresses of gnosis safe's according to: https://fantohm.com/#security
const ethGnosisContract = "0x66a98CfCd5A0dCB4E578089E1D89134A3124F0b1";


module.exports = {
	deadFrom: '2023-10-01',
	fantom: {
		tvl: () => ({}),
		staking: staking(fantomStaking, fantomFhm)
	},
	moonriver: {
		tvl: () => ({}),
		staking: staking(moonriverStaking, moonriverFhm, "moonriver", "fantom:0xfa1FBb8Ef55A4855E5688C0eE13aC3f202486286")
	},
	ethereum: {
		tvl: sumTokensExport({ owner: ethGnosisContract, tokens: [ADDRESSES.ethereum.WETH] }),
	},
	bsc: {
		tvl: () => ({})
	},
	boba: {
		tvl: () => ({})
	},
}
