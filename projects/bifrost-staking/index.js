const { getExports } = require("../helper/heroku-api");

module.exports = {
	timetravel: false,
	bifrost: {
		tvl: async () => {
			const { bifrost } = getExports("bifrost-staking", ["bifrost"]);
			const tvl = await bifrost.tvl();
			return {
				"bifrost-native-coin": tvl["bifrost-native-coin"],
				polkadot: tvl.polkadot,
				kusama: tvl.kusama,
				moonbeam: tvl.moonbeam,
				moonriver: tvl.moonriver,
			};
		},
	},
	ethereum: {
		tvl: async () => {
			const { bifrost } = getExports("bifrost-staking", ["bifrost"]);
			const { eth } = await bifrost.tvl();
			return { eth };
		},
	},
	astar: {
		tvl: async () => {
			const { bifrost } = getExports("bifrost-staking", ["bifrost"]);
			const { astar } = await bifrost.tvl();
			return { astar };
		},
	},
	manta: {
		tvl: async () => {
			const { bifrost } = getExports("bifrost-staking", ["bifrost"]);
			const tvl = await bifrost.tvl();
			return { 'manta-network': tvl['manta-network'] };
		},
	},
};
