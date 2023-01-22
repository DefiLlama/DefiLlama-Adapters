const { getExports } = require('../helper/heroku-api')
const { nullAddress } = require('../helper/unwrapLPs')

module.exports = {
	timetravel: false,
	...getExports("bifrost-staking", ['bifrost']),
	ethereum: {
		tvl: async (_, _1, _2, { api }) => {
			return  {
				[nullAddress]: await api.call({ target: '0xc3d088842dcf02c13699f936bb83dfbbc6f721ab', abi: 'uint256:totalSupply'})
			}
		}
	}
}
