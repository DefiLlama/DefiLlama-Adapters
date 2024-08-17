const { stakings } = require("../helper/staking")

module.exports={
    polygon:{
        staking: stakings([
            "0x1b2430aeedececafb52a3ff8cc8321e9426fc82c", "0x8B55fFfcF528D89fDEfEEac670d24Ae384ca083b"
        ], "0xa3c322ad15218fbfaed26ba7f616249f7705d945", "polygon"),
        tvl:()=>({})
    }
}