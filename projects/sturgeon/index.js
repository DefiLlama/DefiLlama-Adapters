const { sumTokens2 } = require("../helper/unwrapLPs")

const config = {
  "real": {
    controller: "0xE0E71B484Bb20E37d18Ab51fB60c32deC778478A",
  },
}

Object.keys(config).forEach(chain => {
  const { controller } = config[chain]
  module.exports[chain] = {
    tvl: async function (api) {
      const compounderVaults = await api.call({ abi: 'address[]:compounderVaultsList', target: controller })
      const harvesterVaults = await api.call({ abi: 'address[]:harvesterVaultsList', target: controller })
      await api.erc4626Sum({ calls: compounderVaults, isOG4626: true })
      const tridents = await api.multiCall({ abi: 'address:asset', calls: harvesterVaults })
      const tridentBalances = await api.multiCall({ abi: 'uint256:totalAssets', calls: harvesterVaults })
      const token0s = await api.multiCall({ abi: 'address:token0', calls: tridents })
      const tokenBals = await api.multiCall({ abi: 'function getTotalAmounts() external view returns (uint total0, uint total1, uint128 liquidity)', calls: tridents })
      const token1s = await api.multiCall({ abi: 'address:token1', calls: tridents })
      const totalSupplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: tridents })

      tridents.forEach((_, i) => {
        const ratio = tridentBalances[i] / totalSupplies[i]
        api.add(token0s[i], tokenBals[i].total0 * ratio)
        api.add(token1s[i], tokenBals[i].total1 * ratio)
      })
      return sumTokens2({ api })
    },
  }
})
