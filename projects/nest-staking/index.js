const {getConfig} = require("../helper/cache");

async function tvl_ethereum(api) {
  const vaults = await getConfig('nest-vaults', "https://api.nest.credit/v1/vaults");

  const ethereumVaults = (
      vaults?.data
          ?.filter(vault => vault.symbol !== "pUSD")
          .filter(vault => vault.chain.mainnet)
          .map(vault => vault.vaultAddress) ?? []
  ).filter(Boolean);

  const details = await api.multiCall({ abi: 'erc20:totalSupply', calls: ethereumVaults })
  api.add(ethereumVaults, details)
}

async function tvl_plume(api) {
  const vaults = await getConfig('nest-vaults', "https://api.nest.credit/v1/vaults");

  const plumeVaults = (
      vaults?.data
          ?.filter(vault => vault.symbol !== "pUSD")
          ?.filter(vault => vault.chain.plume)
          ?.map(vault => vault.vaultAddress) ?? []
  ).filter(Boolean);

  const details = await api.multiCall({ abi: 'erc20:totalSupply', calls: plumeVaults })
  api.add(plumeVaults, details)
}

async function tvl_plasma(api) {
    const vaults = await getConfig('nest-vaults', "https://api.nest.credit/v1/vaults");

    const plasmaVaults = (
        vaults?.data
            ?.filter(vault => vault.symbol !== "pUSD")
            ?.filter(vault => vault.chain.plasma)
            ?.map(vault => vault.vaultAddress) ?? []
    ).filter(Boolean);

    const details = await api.multiCall({ abi: 'erc20:totalSupply', calls: plasmaVaults })
    api.add(plasmaVaults, details)
}

async function tvl_bsc(api) {
    const vaults = await getConfig('nest-vaults', "https://api.nest.credit/v1/vaults");

    const bscVaults = (
        vaults?.data
            ?.filter(vault => vault.symbol !== "pUSD")
            ?.filter(vault => vault.chain.bsc)
            ?.map(vault => vault.vaultAddress) ?? []
    ).filter(Boolean);

    const details = await api.multiCall({ abi: 'erc20:totalSupply', calls: bscVaults })
    api.add(bscVaults, details)
}

module.exports = {
    methodology: "TVL is calculated from the value of Nest tokens, which represent user shares in vaults backed by yield-generating assets.",
    ethereum: { tvl: tvl_ethereum },
    plume_mainnet: { tvl: tvl_plume },
    plasma: { tvl: tvl_plasma },
    bsc: { tvl: tvl_bsc },
}
