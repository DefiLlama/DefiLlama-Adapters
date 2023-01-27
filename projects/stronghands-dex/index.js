const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    bsc: {
		tvl: getUniTVL({
			chain: 'bsc',
			factory: '0x2C3408a4827DF0419DA2f53eAe92f338B4d314ec',
			useDefaultCoreAssets: true,
		}),
    },
	cronos: {
		tvl: getUniTVL({
			chain: 'cronos',
			factory: '0x1Ed37E4323E429C3fBc28461c14A181CD20FC4E8',
			useDefaultCoreAssets: true,
		}),
	},
	polygon: {
		tvl: getUniTVL({
			chain: 'polygon',
			factory: '0xDD4047F11c80f7831922904Ddb61E370E83D5fbb',
			useDefaultCoreAssets: true,
		}),
	},
}