const { getConfig } = require('../helper/cache')

const config = {
  bsc: { vault: '0x8F73b65B4caAf64FBA2aF91cC5D4a2A1318E5D8C', fromBlock: 48000000, vaultInfo: 'https://api.lista.org/api/moolah/vault/list?page=1&pageSize=1000' }
}
const abi = {
  totalAssets: "uint256:totalAssets",
  idToMarketParams: "function idToMarketParams(bytes32) view returns (address loanToken, address collateralToken, address oracle, address irm, uint256 lltv)",
  market: "function market(bytes32) view returns (uint128 totalSupplyAssets, uint128 totalSupplyShares, uint128 totalBorrowAssets, uint128 totalBorrowShares, uint128 lastUpdate, uint128 fee)"
}


async function getMarketIds(api) {
  const { vaultInfo } = config[api.chain]
  const { data: { list: vaults } } = await getConfig('lista/lending-' + api.chain, vaultInfo)
  return vaults.map(vault => vault.collaterals.map(collateral => collateral.id)).flat()
}

module.exports = {
  methodology: "TVL counts the tokens locked in the protocol's vaults",
  start: '2025-04-01',
  bsc: {
    tvl: async (api) => {
      const { vault, } = config[api.chain]
      const marketIds = await getMarketIds(api)
      const marketInfos = await api.multiCall({ target: vault, abi: abi.idToMarketParams, calls: marketIds })
      const tokens = marketInfos.map(i => [i.collateralToken, i.loanToken]).flat()
      return api.sumTokens({ tokens, owner: vault })
    },
    borrowed: async (api) => {
      const { vault, } = config[api.chain]
      const marketIds = await getMarketIds(api)
      const marketInfos = await api.multiCall({ target: vault, abi: abi.idToMarketParams, calls: marketIds })
      const loanTokens = marketInfos.map(i => i.loanToken)
      const marketInfos2 = await api.multiCall({ target: vault, abi: abi.market, calls: marketIds })
      const borrowedAmounts = marketInfos2.map(market => market.totalBorrowAssets)
      api.add(loanTokens, borrowedAmounts)
    }
  }
} 