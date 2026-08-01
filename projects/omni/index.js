const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
	timetravel: false,
};

const config = {
	astar:  [
		"0xFfFfFfff00000000000000010000000000000008",
		"0xfffFffff00000000000000010000000000000010",
	],
	astrzk:  [
		"0x7746ef546d562b443AE4B4145541a3b1a3D75717",
	],
	moonbeam:  [
		"0xFFFfffFf15e1b7E3dF971DD813Bc394deB899aBf",
		ADDRESSES.moonbeam.VGLMR,
		ADDRESSES.moonbeam.FIL,
	],
	moonriver: [
		ADDRESSES.moonriver.BNC,
		ADDRESSES.moonriver.KSM,
		ADDRESSES.moonriver.MOVR,
	],
}


Object.keys(config).forEach(chain => {
	const tokens = config[chain]
	module.exports[chain] = {
		tvl: async (api) => {
			const supplies = await api.multiCall({  abi: 'erc20:totalSupply', calls: tokens})
			api.add(tokens, supplies)
			return sumTokens2({ api })
		}
	}
})