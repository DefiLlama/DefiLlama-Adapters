const {getCompoundV2Tvl} = require('../helper/compound')

module.exports={
    tvl: getCompoundV2Tvl('0x895879b2c1fbb6ccfcd101f2d3f3c76363664f92', 'ethereum', addr=>{
        if(addr==="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"){
            return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
        }
        return addr
    })
}