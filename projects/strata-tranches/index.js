const srUSDeVault = "0x3d7d6fdf07EE548B939A80edbc9B2256d0cdc003";
const jrUSDeVault = "0xC58D044404d8B14e953C115E67823784dEA53d8F";
const jrNUSDVault = "0xFC807058A352b61aEef6A38e2D0fC3990225E772";
const srNUSDVault = "0x65a44528e8868166401eA08b549E19552af589dB";
const srmHYPERVault = "0x627EA69929212916Ec57B1b26d2E1a19F6129B53";
const jrmHYPERVault = "0xEb205d26E9E605Ec82d1C0d652E00037C278714b";
const srmM1USDVault = "0xCcEd21d609CaC4A272d0c01a8FF4de9cEBc40d60";
const jrmM1USDVault = "0xf7eB8dfec75C42D2d2247FE76Ccaedc59f821688";
const srUSDatVault = "0xFaa9a0e1Db9E22AE3A20B2B58a68DC24D053d066";
const jrUSDatVault = "0x011e55d2b28306458e37Ca7E997C879BB25A455D";

module.exports = {
    methodology: "Protocol TVL refers to the dollar value of all assets deposited into the protocol smart contracts.",
    ethereum: {
        async tvl (api) {
            return await api.erc4626Sum2({
                calls: [ srUSDeVault, jrUSDeVault, srNUSDVault, jrNUSDVault, srmHYPERVault, jrmHYPERVault, srmM1USDVault, jrmM1USDVault, srUSDatVault, jrUSDatVault ],
            });
        }
    },
};
