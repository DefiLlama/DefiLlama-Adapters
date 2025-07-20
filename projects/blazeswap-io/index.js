const { getFactoryTvl } = require("../terraswap/factoryTvl");

module.exports = {
	timetravel: false,
	misrepresentedTokens: true,
	methodology: "Liquidity on the DEX",
	xion: {
		tvl: getFactoryTvl(
			"xion16xry9c286uq7dl9qcn6xn7j4gpr5ds4aryk5tzna6xmz203kvpnqda3hya",
		),
	},
};
