const mineralVaults = ["0x9D08946Ca5856f882A56c29042FbEDC5142663b9"];

async function tvl_ethereum(api) {
    const totalSupplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: mineralVaults });
    api.add(mineralVaults, totalSupplies);
}

async function tvl_plume_mainnet(api) {
    const totalSupplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: mineralVaults });
    api.add(mineralVaults, totalSupplies);
}

module.exports = {
    methodology: "TVL is the total supply of tokens, each representing a fully-backed real-world oil & gas asset from Mineral Vault funds.",
    ethereum: { tvl: tvl_ethereum },
    plume_mainnet: { tvl: tvl_plume_mainnet },
}
