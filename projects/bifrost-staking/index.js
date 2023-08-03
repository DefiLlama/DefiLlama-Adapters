const BigNumber = require("bignumber.js")
const { getExports } = require('../helper/heroku-api')
const { nullAddress } = require('../helper/unwrapLPs')

module.exports = {
	timetravel: false,
	bifrost: {
		tvl: async () => {
			const { bifrost } = getExports("bifrost-staking", ['bifrost'])
			const tvl = await bifrost.tvl()
			return { 'bifrost-native-coin': tvl['bifrost-native-coin'], polkadot: tvl.polkadot, kusama: tvl.kusama, moonbeam: tvl.moonbeam, moonriver: tvl.moonriver, }
		}
	},
	ethereum: {
		tvl: async (_, _1, _2, { api }) => {
			const vETH = await api.call({ target: '0x4bc3263eb5bb2ef7ad9ab6fb68be80e43b43801f', abi: 'uint256:totalSupply' })
			const contract_veth1 = await api.call({ target: '0xc3d088842dcf02c13699f936bb83dfbbc6f721ab', abi: 'uint256:totalSupply' })
			const contract_veth1_null_address_balance = await api.call({ target: '0xc3d088842dcf02c13699f936bb83dfbbc6f721ab', abi: 'erc20:balanceOf', params: '0x000000000000000000000000000000000000dEaD' })

			return {
				[nullAddress]: new BigNumber(vETH).plus(contract_veth1).minus(contract_veth1_null_address_balance).toString(),
			}
		}
	},
	filecoin: {
		tvl: async () => {
			const { bifrost } = getExports("bifrost-staking", ['bifrost'])
			const { filecoin } = await bifrost.tvl()
			return { filecoin }
		}
	},
}
