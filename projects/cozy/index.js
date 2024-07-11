const ADDRESSES = require('../helper/coreAssets.json')
const {compoundExports} = require('../helper/compound')

const transform = addr=>{
    if(addr==="0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"){
        return ADDRESSES.ethereum.WETH
    }
    return addr
}

module.exports={
            methodology: "Count tokens the same way we count for compound",
    ethereum: compoundExports('0x895879b2c1fbb6ccfcd101f2d3f3c76363664f92', "ethereum", undefined, undefined, transform)
}