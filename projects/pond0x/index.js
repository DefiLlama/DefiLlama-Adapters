const {staking} = require("../helper/staking")

module.exports={
    ethereum:{
        tvl:()=>({}),
        staking: staking("0xed96E69d54609D9f2cFf8AaCD66CCF83c8A1B470", "0x423f4e6138e475d85cf7ea071ac92097ed631eea")
    }
}