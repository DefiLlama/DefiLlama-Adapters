const vaultManagers = {
    ethereum: "0x2f52C3664Ff2b12A1A8Bc7B6020C7E92DBa781aE",
}

Object.keys(vaultManagers).forEach(chain => {
    module.exports[chain] = {
        tvl: async (api) => {
            const { details } = await api.call({ abi, target: vaultManagers[chain], })
            await api.sumTokens({ tokensAndOwners: details.map(({ collateralAddress, subVaultAddress }) => [collateralAddress, subVaultAddress]) })
        }
    }
})

const abi = { "inputs": [], "name": "getAllSubVaults", "outputs": [{ "internalType": "address[]", "name": "collaterals", "type": "address[]" }, { "components": [{ "internalType": "string", "name": "integrationType", "type": "string" }, { "internalType": "address", "name": "collateralAddress", "type": "address" }, { "internalType": "address", "name": "subVaultAddress", "type": "address" }, { "internalType": "uint256", "name": "price", "type": "uint256" }, { "internalType": "uint256", "name": "ltv", "type": "uint256" }, { "internalType": "bool", "name": "isActive", "type": "bool" }, { "internalType": "uint256", "name": "registeredAt", "type": "uint256" }, { "internalType": "uint256", "name": "lastUpdatedAt", "type": "uint256" }, { "internalType": "enum DataTypes.TokenType", "name": "tokenType", "type": "uint8" }], "internalType": "struct DataTypes.CollateralDetails[]", "name": "details", "type": "tuple[]" }], "stateMutability": "view", "type": "function" }