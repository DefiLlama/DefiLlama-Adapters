const { compoundExports } = require('../helper/compound')
const { pool2 } = require('../helper/pool2')
const sdk = require('@defillama/sdk');

module.exports = {
    methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets",
    avax: {
        tvl: sdk.util.sumChainTvls([
            compoundExports("0x486af39519b4dc9a7fccd318217352830e8ad9b4", "0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c").tvl,
            compoundExports("0xD7c4006d33DA2A0A8525791ed212bbCD7Aca763F").tvl,
        ]),
        borrowed: sdk.util.sumChainTvls([
            compoundExports("0x486af39519b4dc9a7fccd318217352830e8ad9b4", '0x5C0401e81Bc07Ca70fAD469b451682c0d747Ef1c').borrowed,
            compoundExports("0xD7c4006d33DA2A0A8525791ed212bbCD7Aca763F").borrowed,
        ]),
        pool2: pool2("0x784da19e61cf348a8c54547531795ecfee2affd1", "0xe530dc2095ef5653205cf5ea79f8979a7028065c")
    }
}