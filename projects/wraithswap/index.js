const { uniTvlExport } = require("../helper/calculateUniTvl");
const { stakingUnknownPricedLP } = require("../helper/staking");

const factory = "0xCC738D2fDE18fe66773b84c8E6C869aB233766D1"
const masterchef = "0x37b106f101a63D9d06e53140E52Eb6F8A3aC5bBc"
const wra = "0x4cf098d3775bd78a4508a13e126798da5911b6cd"

module.exports = {
    fantom: {
        tvl: uniTvlExport(factory, 'fantom'),
        staking: stakingUnknownPricedLP(masterchef, wra, "fantom", "0x6a80BD3eb550adcfF4f2f5f12a1bB213c1Ef57fA")
    }
}