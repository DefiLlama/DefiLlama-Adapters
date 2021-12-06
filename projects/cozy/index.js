const {compoundExports} = require('../helper/compound')

const transform = addr=>{
    if(addr==="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"){
        return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
    }
    return addr
}

module.exports={
    timetravel: true,
    doublecounted: false,
    methodology: "Count tokens the same way we count for compound",
    ethereum: compoundExports('0x895879b2c1fbb6ccfcd101f2d3f3c76363664f92', "ethereum", undefined, undefined, transform)
}