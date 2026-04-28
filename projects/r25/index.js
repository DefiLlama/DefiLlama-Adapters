const vRPCWeeklyVault = "0x1c2bc8b553d9a7e61f7531a3a4bf2162f4569268";
const vRPCQuarterlyVault = "0x94f7ebc6ae0819a4b4e231ae6ddaaf9bfd2a1a86";
const vRPCSemiYearlyVault = "0xee26bb0989691735c997dfdc49a4a607f75e190b";
const pCreditVault = "0x39976f3Ef143a5824d4E4c28c204d556113dCF7f";


module.exports = {
    methodology: "TVL represents the total value of assets held within the vault. Each vault token is minted using USDC and appreciates in line with the performance of the underlying asset.",
    pharos: {
        async tvl(api) {
            return await api.erc4626Sum2({
                calls: [vRPCWeeklyVault, vRPCQuarterlyVault, vRPCSemiYearlyVault, pCreditVault],
            });
        }
    },
};