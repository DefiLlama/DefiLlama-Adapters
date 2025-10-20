const srUSDeVault = "0x3d7d6fdf07EE548B939A80edbc9B2256d0cdc003";
const jrUSDeVault = "0xC58D044404d8B14e953C115E67823784dEA53d8F";

module.exports = {
    methodology: "Total value of all coins held in the smart contracts of the protocol.",
    ethereum: {
        async tvl (api) {
            return await api.erc4626Sum2({
                calls: [ srUSDeVault, jrUSDeVault ],
            });
        }
    },
};
