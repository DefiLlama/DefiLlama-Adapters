const { sumTokens2 } = require("./unwrapLPs")

const abi = {
  asset: "address:asset",
  collateralContract: "address:collateralContract",
  getAllPairAddresses: "address[]:getAllPairAddresses",
  totalAssets: "uint256:totalAsset",
  totalCollateral: "uint256:totalCollateral",
  totalBorrow: 'function totalBorrow() view returns (uint128 amount, uint128 shares)',
}

function fraxlendExports(config) {
  const exports = {
    methodology: 'Gets the pairs from the REGISTRY_ADDRESS and adds the collateral amounts from each pair',
  }

  Object.keys(config).forEach(chain => {
    let { registry, blacklistedTokens = [] } = typeof config[chain] === 'string' ? { registry: config[chain] } : config[chain]

    async function tvl(api) {
      const pairs = await api.call({ target: registry, abi: abi.getAllPairAddresses, chain: api.chain })
      const assets = await api.multiCall({ abi: abi.asset, calls: pairs })
      const collaterals = await api.multiCall({ abi: abi.collateralContract, calls: pairs })
      const tokens = collaterals.concat(assets)
      const owners = pairs.concat(pairs)
      return sumTokens2({ api, tokensAndOwners2: [tokens, owners], blacklistedTokens, })
    }

    async function borrowed(api) {
      const pairs = await api.call({ target: registry, abi: abi.getAllPairAddresses, chain: api.chain })
      const assets = await api.multiCall({ abi: abi.asset, calls: pairs })
      const bals = (await api.multiCall({ abi: abi.totalBorrow, calls: pairs })).map(i => i.amount)
      api.add(assets, bals)
    }

    exports[chain] = {
      tvl, borrowed,
    }
  })


  return exports
}

module.exports = { fraxlendExports }