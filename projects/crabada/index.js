const {staking} = require('../helper/staking')

module.exports={
    avalanche:{
        staking: staking("0xd2cd7a59aa8f8fdc68d01b1e8a95747730b927d3", "0xa32608e873f9ddef944b24798db69d80bbb4d1ed", "avax"),
        tvl: ()=>({})
    }
}