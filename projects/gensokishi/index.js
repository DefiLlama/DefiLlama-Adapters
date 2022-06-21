const { staking } = require("../helper/staking")

module.exports={
    polygon:{
        staking: staking("0x1b2430aeedececafb52a3ff8cc8321e9426fc82c", "0xa3c322ad15218fbfaed26ba7f616249f7705d945", "polygon", "polygon:0xa3c322ad15218fbfaed26ba7f616249f7705d945"),
        tvl:()=>({})
    }
}