const {masterChefExports, standardPoolInfoAbi} = require('../helper/masterchef')

module.exports=masterChefExports("0x6f536B36d02F362CfF4278190f922582d59E7e08", "fantom", "0xf04d7f53933becbf51ddf1f637fe7ecaf3d4ff94", true, 
    standardPoolInfoAbi
)