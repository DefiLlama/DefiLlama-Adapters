
const BERA_VAULTS = [
  {
    address: "0x40540b9CE95EBdbBcbfd88ceB40a183B20a57fd7",
    kodiakIsland: "0x564f011D557aAd1cA09BFC956Eb8a17C35d490e0",
    token0: "0x6969696969696969696969696969696969696969",
    token1: "0xac03CABA51e17c86c921E1f6CBFBdC91F8BB2E6b"
  },
  {
    address: "0xB5D5c690802a24Be3EE08A5d6e243B9E9926d679",
    kodiakIsland: "0x98bDEEde9A45C28d229285d9d6e9139e9F505391",
    token0: "0x18878Df23e2a36f81e820e4b47b4A40576D3159C",
    token1: "0xFCBD14DC51f0A4d49d5E53C2E0950e0bC26d0Dce"
  },
  {
    address: "0xd4A98C1e2E3907621867C21b16a465233B31f8b8",
    kodiakIsland: "0x337eF1eB6c8BBeD571170Fc2b468608ab9e2Aac8",
    token0: "0x6969696969696969696969696969696969696969",
    token1: "0xBaadCC2962417C01Af99fb2B7C75706B9bd6Babe"
  },
]

async function beraTvl(api) {
  for (const vault of BERA_VAULTS) {
    // Get total token assets in kodiak island
    const {amount0Current, amount1Current} = await api.call({
      abi: "function getUnderlyingBalances() view returns (uint256 amount0Current, uint256 amount1Current)",
      target: vault.kodiakIsland
    })
    const vaultBalance = await api.call({
      abi: "function totalAssets() view returns (uint256 totalAssets)",
      target: vault.address,
    })
    const totalSupply = await api.call({
      abi: "erc20:totalSupply",
      target: vault.kodiakIsland
    })

    // Calculate vault assets based on island assets and vault balance
    const token0Balance = amount0Current * vaultBalance / totalSupply
    const token1Balance = amount1Current * vaultBalance / totalSupply

    api.add(vault.token0, token0Balance)
    api.add(vault.token1, token1Balance)
  }
}

module.exports = {
  berachain: {
    tvl: beraTvl
  }
};
