const { getConfig } = require('../helper/cache')

const vaultsUrl = "https://raw.githubusercontent.com/UniverseFinance/UniverseFinanceProtocol/main/doc/vaultAddress.json";

async function tvl(api) {
  let resp = await getConfig('Universe', vaultsUrl);

  let allVaults1 = resp.filter(vault => vault.type === 1 && vault.chain == api.chain).map((vault) => vault.address)
  let allVaults2 = resp.filter(vault => vault.type === 2 && vault.chain == api.chain).map((vault) => vault.address)
  const token0s1 = await api.multiCall({ abi: 'address:token0', calls: allVaults1 })
  const token1s1 = await api.multiCall({ abi: 'address:token1', calls: allVaults1 })
  const token0s2 = await api.multiCall({ abi: 'address:token0', calls: allVaults2 })
  const token1s2 = await api.multiCall({ abi: 'address:token1', calls: allVaults2 })
  const getTotalAmounts1 = await api.multiCall({ abi: 'function getTotalAmounts() view returns (uint256 liq, uint256 total0, uint256 total1)', calls: allVaults1 })
  const getTotalAmounts2 = await api.multiCall({ abi: 'function getTotalAmounts() view returns (uint256 total0, uint256 total1, uint256 free0, uint256 free1, uint256 util0, uint256 util1)', calls: allVaults2 })

  allVaults1.forEach((vault, idx) => {
    api.add(token0s1[idx], getTotalAmounts1[idx].total0)
    api.add(token1s1[idx], getTotalAmounts1[idx].total1)
  })

  allVaults2.forEach((vault, idx) => {
    api.add(token0s2[idx], getTotalAmounts2[idx].total0)
    api.add(token1s2[idx], getTotalAmounts2[idx].total1)
  })
}

module.exports = {
  doublecounted: true,
  methodology: "Vault TVL consists of the tokens in the vault contract and the total amount in the UNI V3 pool through the getTotalAmounts ABI call",
  ethereum: { tvl },
  polygon: { tvl },
};
