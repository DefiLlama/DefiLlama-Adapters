const axios = require('axios')
const { getLogs2 } = require('../helper/cache/getLogs')

const config = {
  bsc: {
    vault: '0x8F73b65B4caAf64FBA2aF91cC5D4a2A1318E5D8C',
    fromBlock: 48000000,
  }
}
const abi = {
    totalAssets: "uint256:totalAssets",
    idToMarketParams: "function idToMarketParams(bytes32) view returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)",
    market: "function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)"
}
const eventAbis = {
  supplyCollateral: 'event SupplyCollateral(bytes32 indexed id, address indexed caller, address indexed onBehalf, uint256 assets)',
  withdrawCollateral: 'event WithdrawCollateral(bytes32 indexed id, address caller, address indexed onBehalf, address indexed receiver, uint256 assets)',
  liquidate: 'event Liquidate(bytes32 indexed id, address indexed caller, address indexed borrower, uint256 repaidAssets, uint256 repaidShares, uint256 seizedAssets, uint256 badDebtAssets, uint256 badDebtShares)'
}

module.exports = {
  methodology: "TVL counts the tokens locked in the protocol's vaults based on supply, withdraw and liquidate events",
  start: '2025-04-01',
  misrepresentedTokens: true,
  bsc: {
    tvl: async (api) => {
      const { data: { data: vaults } } = await axios.get('https://api.lista.org/api/moolah/vault/list?page=1&pageSize=1000')
      
      // Create set of assets and collect collateral IDs
      const assets = new Set()
      const collateralIds = []
      
      vaults.list.forEach(vault => {
        assets.add(vault.asset)
        vault.collaterals.forEach(collateral => {
          collateralIds.push(collateral.id)
        })
      })

      // Get collateral tokens from idToMarketParams
      const marketParams = await api.multiCall({
        abi: abi.idToMarketParams,
        calls: collateralIds.map(id => ({
          target: config.bsc.vault,
          params: [id]
        }))
      })

      const collateralTokens = new Set(marketParams.map(param => param.collateralToken))

      // Build tokensAndOwners array
      const tokensAndOwners = []

      // Add assets
      assets.forEach(asset => {
        tokensAndOwners.push([asset, config.bsc.vault])
      })

      // Add collateral tokens
      collateralTokens.forEach(token => {
        tokensAndOwners.push([token, config.bsc.vault])
      })

      return api.sumTokens({ tokensAndOwners })
    },
    borrowed: async (api) => {
      const { data: { data: vaults } } = await axios.get('https://api.lista.org/api/moolah/vault/list?page=1&pageSize=1000')
      
      // Collect all collateral IDs
      const collateralIds = []
      vaults.list.forEach(vault => {
        vault.collaterals.forEach(collateral => {
          collateralIds.push(collateral.id)
        })
      })

      // Get loan tokens from idToMarketParams
      const marketParams = await api.multiCall({
        abi: abi.idToMarketParams,
        calls: collateralIds.map(id => ({
          target: config.bsc.vault,
          params: [id]
        }))
      })

      // Get market data for each ID
      const marketData = await api.multiCall({
        abi: abi.market,
        calls: collateralIds.map(id => ({
          target: config.bsc.vault,
          params: [id]
        }))
      })

      // Add borrowed amounts for each loan token
      marketParams.forEach((param, i) => {
        const totalBorrowAssets = marketData[i].totalBorrowAssets
        if (totalBorrowAssets > 0) {
          api.add(param.loanToken, totalBorrowAssets)
        }
      })

      return api.getBalances()
    }
  }
} 