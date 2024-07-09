const stakingContract = '0x0464a36beCf9967111D2dCAb57CAf4a2376f6E3F'
const blast = '0xb1a5700fa2358173fe465e6ea4ff52e36e88e2ad'
const { staking } = require('../helper/staking')


module.exports = {
	methodology: "BLAST can be staked in Blasterswap vault",
	blast: {
		tvl: () => ({}),
		staking: staking(stakingContract, blast),
	},
}
