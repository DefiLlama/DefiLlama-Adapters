const { sumTokens2 } = require("../helper/unwrapLPs");

module.exports = {
	timetravel: false,
};

const config = {
	astar:  [
		"0xFfFfFfff00000000000000010000000000000008",
		"0xfffFffff00000000000000010000000000000010",
	],
	moonbeam:  [
		"0xFFFfffFf15e1b7E3dF971DD813Bc394deB899aBf",
		"0xFfFfFFff99dABE1a8De0EA22bAa6FD48fdE96F6c",
		"0xFffffFffCd0aD0EA6576B7b285295c85E94cf4c1",
	],
	moonriver: [
		"0xFFffffff3646A00f78caDf8883c5A2791BfCDdc4",
		"0xFFffffFFC6DEec7Fc8B11A2C8ddE9a59F8c62EFe",
		"0xfFfffFfF98e37bF6a393504b5aDC5B53B4D0ba11",
	],
}


Object.keys(config).forEach(chain => {
	const tokens = config[chain]
	module.exports[chain] = {
		tvl: async (_, _b, _cb, { api, }) => {
			const supplies = await api.multiCall({  abi: 'erc20:totalSupply', calls: tokens})
			api.add(tokens, supplies)
			return sumTokens2({ api })
		}
	}
})