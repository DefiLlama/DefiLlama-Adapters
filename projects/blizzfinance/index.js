const { aaveExports } = require('../helper/aave')

module.exports={
    timetravel: true,
    methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
    avax:{
        tvl: aaveExports("avax", "0xfF50b540c9152F1841edF47b49dA69696Be59783").tvl,
        borrowed: ()=>({}) // hacked, it's all bad debt
    },
    deadFrom: 1652356800,
    hallmarks:[
        [1652356800, "Outdated Oracle Exploit"],
      ],
}
