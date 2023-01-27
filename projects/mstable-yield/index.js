const sdk = require('@defillama/sdk')

const vaults = [
  '0x9614a4C61E45575b56c7e0251f63DCDe797d93C5', // 3CRV
]

module.exports = {
  ethereum: {
    tvl: async (_, block) => {
      const totalAssets = await sdk.api2.abi.multiCall({
        abi: abis.totalAssets, calls: vaults,block,
      })
      const asset = await sdk.api2.abi.multiCall({
        abi: abis.asset, calls: vaults,block,
      })

      const balances = {}
      vaults.map((_,i) => sdk.util.sumSingleBalance(balances,asset[i],totalAssets[i], 'ethereum'))
      return balances
    }
  }
}

const abis = {
  totalAssets: "uint256:totalAssets",
  asset: "address:asset",
}