const stakingPool = '0x77777779ee2d933da027ee1fb3590c41529046c8'

async function tvl(api) {
	// getPoolStat returns the sKLAY supply and the KLAY delegated behind it. Book the KLAY:
	// sKLAY's own price feed only quotes a third of the days, so reading its supply left TVL at $0 most days.
	const { totalStaking } = await api.call({
		abi: 'function getPoolStat() view returns (uint256 totalSupply, uint256 totalStaking)',
		target: stakingPool,
	})
	api.addGasToken(totalStaking)
}

module.exports = {
	klaytn: { tvl }
}
