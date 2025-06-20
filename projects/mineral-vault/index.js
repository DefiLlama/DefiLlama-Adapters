async function tvl_plume_mainnet(api) {
    const mineralVaults = ["0x5107272921A750A20d492Fb41Acf0b770b09a624"];
    const details = await api.multiCall({ abi: 'erc20:totalSupply', calls: mineralVaults })
    api.add(mineralVaults, details)
}

module.exports = {
    methodology: "TVL is the total supply of tokens, each representing a fully-backed real-world oil & gas asset from Mineral Vault funds.",
    plume_mainnet: { tvl: tvl_plume_mainnet },
}
