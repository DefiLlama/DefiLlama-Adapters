const pUSDeVault = "0xA62B204099277762d1669d283732dCc1B3AA96CE";

module.exports = {
    methodology: "TVL includes USDe/eUSDe tokens locked in Strata’s Season 0 vault on Ethereum.",
    ethereum: {
        async tvl (api) {
            return await api.erc4626Sum2({
                calls: [ pUSDeVault ],
            });
        }
    },
};
