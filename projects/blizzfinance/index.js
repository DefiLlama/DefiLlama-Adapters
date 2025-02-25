const { aaveExports } = require('../helper/aave')
const methodologies = require('../helper/methodologies')

module.exports={
        methodology: methodologies.lendingMarket,
    avax:{
        tvl: aaveExports("avax", "0xfF50b540c9152F1841edF47b49dA69696Be59783").tvl,
        borrowed: ()=>({}) // hacked, it's all bad debt
    },
    deadFrom: 1652356800,
    hallmarks:[
        [1652356800, "Outdated Oracle Exploit"],
      ],
}
