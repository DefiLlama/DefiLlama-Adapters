const { compoundExports2 } = require('../helper/compound')
const { staking } = require('../helper/staking')


module.exports = {
    hallmarks: [
        [1652572800,"DEI depeg"]
    ],
    methodology: "Same as compound, we just get all the collateral (not borrowed money) on the lending markets. fUSD is returned as TUSD",
            fantom: {
        staking: staking("0xe3d17c7e840ec140a7a51aca351a482231760824", "0xe0654C8e6fd4D733349ac7E09f6f23DA256bF475"),
        ...compoundExports2({ comptroller: "0x260e596dabe3afc463e75b6cc05d8c46acacfb09", }),
    }
}

module.exports.deadFrom = '2022-05-15'
module.exports.fantom.borrowed=  () => ({})