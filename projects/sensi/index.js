const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const SENSI_TOKEN_CONTRACT = '0x63e77cf206801782239d4f126cfa22b517fb4edb'
const SENSI_LOCKING_CONTRACT = '0xc13Aff57B67145012Ef3a4604bDB3f3dA17E114f'
const SENSI_SY_CONTRACT = '0x21B656d3818A1dD07B800c1FE728fB81921af3A3'

const SY_ABI = {
	"getSYPortfolio": "function getSYPortfolio() view returns ((uint256 totalPayToken, uint256 totalBuyInToken, uint256 rewardsInPool, uint256 rewardsLastRun, uint256 lockingLastRun, uint256 SENSICirculatingSupply, uint256 SYNFTCirculatingSupply, uint256 lastMintedSYNFTID, uint256 totalVaults, uint256 totalActiveVaults) SY_Portfolio)"
}

async function tvl(api) {
	const balance_of_SY = await api.call({ abi: SY_ABI.getSYPortfolio, target: SENSI_SY_CONTRACT })

	const balance_of_SY_TVL = balance_of_SY.totalPayToken
	api.add(ADDRESSES.null, balance_of_SY_TVL)
}

module.exports = {
	methodology: 'Counts how many tokens are in Sensi Locks and in SmartYield',
	bsc: {
		tvl,
		staking: staking(SENSI_LOCKING_CONTRACT, SENSI_TOKEN_CONTRACT),
	}
}