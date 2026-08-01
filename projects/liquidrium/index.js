
const abi = {
  "getTotalAmounts": "function getTotalAmounts() view returns (uint256 total0, uint256 total1)"
}

module.exports = {
	methodology: 'We iterate through each HyperLiquidrium and get the total amounts of each deposited asset, then multiply it by their USD dollar provided by CoinGecko'
}

const config = {
	ethereum: [
 "0xF82aeDC7faA3Fe1F412C71fe5E432690C46cd1bb", 
 "0x3FeE1B1C829DB1250B0e6B8605741E944Ed3A41e", 
	],
	arbitrum: [
		'0x7F6d25dE79559e548f0417aeB1953Ab6D3D85b14',
		'0x849668517a74535EC5ECc09Fa9A22e0CEf91443E',
	],
	polygon: [
		'0xB19e59b77E173363FB7Ce674f1279c76ee237c7A',
		'0x249403E3163aAA88259e0e79A513E999EF8AbEc3',
	]
}

Object.keys(config).forEach(chain => {
	const vaults = config[chain]
	module.exports[chain] = {
		tvl: async (api) => {
			const token0s = await api.multiCall({  abi: 'address:token0', calls: vaults})
			const token1s = await api.multiCall({  abi: 'address:token1', calls: vaults})
			const totals = await api.multiCall({  abi: abi.getTotalAmounts, calls: vaults})
			totals.forEach((total, i) => {
				api.add(token0s[i], total.total0)
				api.add(token1s[i], total.total1)
			})
		}
	}
})