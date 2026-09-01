const collateralVault = '0x5dafc0eE88997a2A2Aa4b8e9c4411fab82FE2B16'
const ZTLN = '0xfEd3D6557Dc46A1B25d0A6F666513Cb33835864B'

const abi = {
	getAllSubVaults: 'function getAllSubVaults() view returns (address[] collaterals, (string integrationType, address collateralAddress, address subVaultAddress, uint256 price, uint256 ltv, bool isActive, uint256 registeredAt, uint256 lastUpdatedAt, uint8 tokenType)[] details)'
}

const tvl = async (api) => {
	const activeVaults = await api.call({ target: collateralVault, abi: abi.getAllSubVaults })

	const tokensAndOwners = activeVaults.details.map((vault) => {
		const { collateralAddress, subVaultAddress} = vault
		return [collateralAddress, subVaultAddress]
	})

	return api.sumTokens({ tokensAndOwners, blacklistedTokens: [ZTLN] })
}

module.exports = {
	ethereum: { tvl }
}