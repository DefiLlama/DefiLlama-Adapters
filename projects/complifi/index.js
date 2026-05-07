
const abi = {
  "getAllVaults": "address[]:getAllVaults",
  "getVaultCollateral": "address:collateralToken",
  "getAllPools": "address[]:getAllPools",
  "getConfig": "function getConfig() view returns (tuple(uint256 minExitAmount, uint256 protocolFee, address feeWallet, address collateralToken, address collateralOracle, address collateralOracleIterator, address volatilityEvolution, address underlyingLiquidityValuer, address exposure, address poolShare, address traderPortfolio, uint8 collateralDecimals))"
}

const config = {
  ethereum: {
    VAULT_FACTORY_PROXY: '0x3269DeB913363eE58E221808661CfDDa9d898127',
  },
  polygon:{
    VAULT_FACTORY_PROXY: '0xE970b0B1a2789e3708eC7DfDE88FCDbA5dfF246a',
    POOL_FACTORY_PROXY: '0x501FE5583f2ebC9f62fe9CD71637D746c7943686',
  },
}

Object.keys(config).forEach(chain => {
  const {VAULT_FACTORY_PROXY, POOL_FACTORY_PROXY,} = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (VAULT_FACTORY_PROXY) {
        const vaults = await api.call({ target: VAULT_FACTORY_PROXY, abi: abi.getAllVaults })
        const vaultCollaterals = await api.multiCall({ abi: abi.getVaultCollateral, calls: vaults })
        return api.sumTokens({ tokensAndOwners2: [vaultCollaterals, vaults]})
      }

      if (POOL_FACTORY_PROXY) {
        const pools = await api.call({ target: POOL_FACTORY_PROXY, abi: abi.getAllPools })
        const tokens  = await api.multiCall({  abi: abi.getConfig, calls: pools, field: 'collateralToken' })
        return api.sumTokens({ tokensAndOwners2: [tokens, pools]})
      }
    }
  }
})
