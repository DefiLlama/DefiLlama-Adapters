const {getConfig} = require("../helper/cache");

async function tvl_ethereum(api) {
  const vaults = await getConfig('nest-vaults', "https://app.nest.credit/api/vaults?includeHidden=true");
  const ethereumVaults = vaults?.map(vault => vault.plume?.contractAddress) ?? [];
  const details = await api.multiCall({ abi: 'erc20:totalSupply', calls: ethereumVaults })
  api.add(ethereumVaults, details)
}

async function tvl_plume(api) {
  const vaults = await getConfig('nest-vaults', "https://app.nest.credit/api/vaults?includeHidden=true");
  const plumeVaults = vaults?.map(vault => vault.plume?.contractAddress) ?? [];
  const details = await api.multiCall({ abi: 'erc20:totalSupply', calls: plumeVaults })
  api.add(plumeVaults, details)
}

module.exports = {
  methodology: "TVL is calculated from the value of Nest tokens, which represent user shares in vaults backed by yield-generating assets.",
  ethereum: { tvl: tvl_ethereum },
  plume_mainnet: { tvl: tvl_plume },
}
