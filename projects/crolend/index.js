const { getCompoundV2Tvl } = require('../helper/compound')

module.exports = {
    hallmarks: [
        [1670004805, "Project rugged"]
    ],
    cronos: {
        tvl: getCompoundV2Tvl("0x30dF4C58ADaf1FcF388B7Bf775840DEc086dcB98", "cronos"),
        borrowed: ()=>({})
    }
}