const { staking } = require("../helper/staking")

module.exports={
    ethereum:{
        tvl:()=>({}),
        staking: staking("0x4401c51110e7d3a970Fe48AeaeE8249b181210a1","0x922D8563631B03C2c4cf817f4d18f6883AbA0109")
    }
}