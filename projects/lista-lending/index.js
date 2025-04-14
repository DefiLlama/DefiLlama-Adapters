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
    idToMarketParams: "function idToMarketParams(bytes32) view returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)"
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
        
    //   const { data: { data: vaults } } = await axios.get('https://api.lista.org/api/moolah/vault/list?page=1&pageSize=1000')
      
    //   const totalAssets = await api.multiCall({
    //     abi: abi.totalAssets,
    //     calls: vaults.list.map(i => i.address)
    //   })
    //   const tokensAndOwners = vaults.list.map((vault, i) => {
    //     api.add(vault.asset, totalAssets[i])
    //     return [vault.asset, vault.address]
    //   })

        
    
    //   const [supplyLogs
    //     , withdrawLogs,
    //      liquidateLogs
    // ] = await Promise.all([
    //     getLogs2({ 
    //       api, 
    //       target: config.bsc.vault,
    //       eventAbi: eventAbis.supplyCollateral,
    //       fromBlock: config.bsc.fromBlock,
    //       extraKey: 'SupplyCollateral',
          
    //     }),
    //     getLogs2({ 
    //       api, 
    //       target: config.bsc.vault,
    //       eventAbi: eventAbis.withdrawCollateral,
    //       fromBlock: config.bsc.fromBlock,
    //       extraKey: 'WithdrawCollateral'
    //     }),
    //     getLogs2({ 
    //       api, 
    //       target: config.bsc.vault,
    //       eventAbi: eventAbis.liquidate,
    //       fromBlock: config.bsc.fromBlock,
    //       extraKey: 'Liquidate'
    //     })
    //   ])

    

    //   const tokenBalances = {}
      
    //   const uniqueIds = [...new Set(supplyLogs.map(log => log.id))]

    //   const marketParams = await api.multiCall({
    //     abi: abi.idToMarketParams,
    //     calls: uniqueIds.map(id => ({
    //       target: config.bsc.vault,
    //       params: [id]
    //     }))
    //   })

    //   const idToCollateralToken = {}
    //   uniqueIds.forEach((id, i) => {
    //     idToCollateralToken[id] = marketParams[i].collateralToken
    //   })

    //   supplyLogs.forEach(log => {
    //     const collateralToken = idToCollateralToken[log.id]
    //     const amount = log.assets
    //     tokenBalances[collateralToken] = (tokenBalances[collateralToken] || 0) + Number(amount)
    //   })

    //   withdrawLogs.forEach(log => {
    //     const collateralToken = idToCollateralToken[log.id]
    //     const amount = log.assets
    //     tokenBalances[collateralToken] = (tokenBalances[collateralToken] || 0) - Number(amount)
    //   })

    //   liquidateLogs.forEach(log => {
    //     const collateralToken = idToCollateralToken[log.id]
    //     const amount = log.seizedAssets
    //     tokenBalances[collateralToken] = (tokenBalances[collateralToken] || 0) - Number(amount)
    //   })

    //   Object.entries(tokenBalances).forEach(([token, balance]) => {
    //     if (balance > 0) {
    //       api.add(token, balance)
    //     }
    //   })

    //   return api.getBalances()
    const { data: { data: { totalDeposits, totalCollateral } } } = await axios.get('https://api.lista.org/api/moolah/overall')
      
      // Convert string to number and sum up
      const totalValue = Number(totalDeposits) + Number(totalCollateral)
      
      return {
        'tether': totalValue
      }
    }
  }
} 