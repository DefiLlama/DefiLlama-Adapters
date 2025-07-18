async function tvl_plume_mainnet(api) {
    const mineralVaults = ["0x5107272921A750A20d492Fb41Acf0b770b09a624"];
    const issuerReserveWallets = ["0xCcBA2623B2CE6148c09d8E676B81E472D85c21Ea"];

    const totalSupplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: mineralVaults });
    const issuerReserveBalances = await api.multiCall({
        abi: 'erc20:balanceOf',
        calls: mineralVaults.flatMap(token => issuerReserveWallets.map(owner => ({ target: token, params: owner })))
    });

    const circulatingSupplies = mineralVaults.map((vault, index) => {
        const reserveBalances = issuerReserveWallets
            .map((_, j) => BigInt(issuerReserveBalances[index * issuerReserveWallets.length + j]))
            .reduce((a, b) => a + b, 0n);
        return {
            vault,
            circulating: BigInt(totalSupplies[index]) - reserveBalances
        };
    });

    circulatingSupplies.forEach(({ vault, circulating }) => api.add(vault, circulating));
}

module.exports = {
    methodology: "TVL is the total supply of tokens, each representing a fully-backed real-world oil & gas asset from Mineral Vault funds.",
    plume_mainnet: { tvl: tvl_plume_mainnet },
}
