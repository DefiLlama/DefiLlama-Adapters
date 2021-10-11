const { pool2 } = require('../helper/pool2')
const {staking}= require('../helper/staking')

const DPX = "0xeec2be5c91ae7f8a338e1e5f3b5de49d07afdc81"
function transformArbitrum(addr){
    if(addr.toLowerCase() === "0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55"){
        return DPX
    }
    return `arbitrum:${addr}`
}

module.exports={
    ethereum:{
        staking:staking('0xce4d3e893f060cb14b550b3e6b0ad512bef30995', DPX, 'ethereum'),
        pool2: pool2("0x2a52330be21d311a7a3f40dacbfee8978541b74a", "0xf64af01a14c31164ff7381cf966df6f2b4cb349f", "ethereum"),
        tvl: async()=>({})
    },
    arbitrum:{
        staking:staking('0xc6D714170fE766691670f12c2b45C1f34405AAb6', '0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55', 'arbitrum', DPX),
        pool2: pool2("0x96B0d9c85415C69F4b2FAC6ee9e9CE37717335B4", "0x0C1Cf6883efA1B496B01f654E247B9b419873054", "arbitrum", transformArbitrum),
    }
}