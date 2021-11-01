const { getBlock } = require('../helper/getBlock')
const {sumTokens} = require('../helper/unwrapLPs')

const pools = ['0x7Af4e1cE484f40D927b9C90fB6905Df4376fc3F6', '0xd7d974E81382D05E8D9fc6d0d17d0d852e9806dd', '0x69B4B35504a8c1d6179fef7AdDCDB37A8c663BC9', '0x2935CD347B79C319A6464fe3b1087170f142418C']
const tokens = ['0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9', '0xe405de8f52ba7559f9df3c368500b6e6ae6cee49']

async function tvl(ttimestamp, _b, chainBlocks){
    const balances = {}
    const block = await getBlock(ttimestamp, 'optimism', chainBlocks)
    const transform = (addr)=>{
        if(addr === "0xe405de8f52ba7559f9df3c368500b6e6ae6cee49"){
            return '0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb' // sETH
        } else if (addr === "0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9") {
            return "0x57ab1ec28d129707052df4df418d58a2d46d5f51"
        }
    }
    await sumTokens(balances, tokens.map(t=>pools.map(p=>[t,p])).flat(), block, 'optimism', transform)
    return balances
}

module.exports = {
    methodology: 'TVL counts the sETH and sUSD deposits.',
    tvl,
}