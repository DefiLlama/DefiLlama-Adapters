const stakingContract = '0x0464a36beCf9967111D2dCAb57CAf4a2376f6E3F'
const blast = '0x0464a36beCf9967111D2dCAb57CAf4a2376f6E3F'
const { staking } = require('../helper/staking')


module.exports = {
	methodology: "BLAST can be staked in Blasterswap vault",
	ethereum: {
		staking: staking(stakingContract, blast),
		tvl: () => ({})
	},
}
