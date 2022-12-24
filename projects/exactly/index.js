const sdk = require('@defillama/sdk')

module.exports = {
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There are multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.",
};

const config = {
  ethereum: {
    auditor: '0x310A2694521f75C7B2b64b5937C16CE65C3EFE01',
  }
}

Object.keys(config).forEach(chain => {
  const { auditor } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {

      const balances = {}
      const data = await markets(api, auditor)

      data[0].forEach((_, i) => {
        const asset = data[0][i]
        const totalAssets = data[1][i]
        const totalFloatingBorrowAssets = data[2][i]
        const fixedPools = data[3][i]

        sdk.util.sumSingleBalance(balances, asset, totalAssets, chain)
        sdk.util.sumSingleBalance(balances, asset, totalFloatingBorrowAssets * -1, chain)
        fixedPools.forEach(({ borrowed, supplied }) => {
          sdk.util.sumSingleBalance(balances, asset, supplied, chain)
          sdk.util.sumSingleBalance(balances, asset, borrowed * -1, chain)
        })
      })
      return balances
    },
    borrowed: async (_, _b, _cb, { api, }) => {

      const balances = {}
      const data = await markets(api, auditor)

      data[0].forEach((_, i) => {
        const asset = data[0][i]
        const totalFloatingBorrowAssets = data[2][i]
        const fixedPools = data[3][i]

        sdk.util.sumSingleBalance(balances, asset, totalFloatingBorrowAssets, chain)
        fixedPools.forEach(({ borrowed }) => {
          sdk.util.sumSingleBalance(balances, asset, borrowed, chain)
        })
      })
      return balances
    },
  }
})

async function markets(api, target) {
  const markets = await api.call({ abi: abis.allMarkets, target })

  const getters = [
    "asset",
    "totalAssets",
    "totalFloatingBorrowAssets",
  ]
  const gettersData = await Promise.all(getters.map(key => api.multiCall({ abi: abis[key], calls: markets })))
  const fixedPools = await Promise.all(markets.map(target => api.fetchList({ target, lengthAbi: abis.maxFuturePools, itemAbi: abis.fixedPools, })))

  gettersData.push(fixedPools)
  return gettersData
}

const abis = {
  allMarkets: "function allMarkets() view returns (address[])",
  asset: "function asset() view returns (address)",
  fixedPools: "function fixedPools(uint256) view returns ((uint256 borrowed, uint256 supplied, uint256, uint256))",
  maxFuturePools: "function maxFuturePools() view returns (uint8)",
  totalAssets: "function totalAssets() view returns (uint256)",
  totalFloatingBorrowAssets: "function totalFloatingBorrowAssets() view returns (uint256)",
}