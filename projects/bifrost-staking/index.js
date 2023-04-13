const { getExports } = require('../helper/heroku-api')
const { nullAddress } = require('../helper/unwrapLPs')
const BigNumber = require("bignumber.js");

module.exports = {
	timetravel: false,
	...getExports("bifrost-staking", ['bifrost']),
	ethereum: {
		tvl: async (_, _1, _2, { api }) => {
			const vETH = await api.call({ target: '0x4bc3263eb5bb2ef7ad9ab6fb68be80e43b43801f', abi: 'uint256:totalSupply' })
			const vETH_v1 = await api.call({ target: '0xc3d088842dcf02c13699f936bb83dfbbc6f721ab', abi: 'uint256:totalSupply' })

			return {
				[nullAddress]: new BigNumber(vETH).plus(vETH_v1).toString(),
			}
		}
	}
}
