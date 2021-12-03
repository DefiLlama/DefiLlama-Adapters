const { getBlock } = require('../helper/getBlock')
const { staking } = require('../helper/staking')
const { sumTokens } = require('../helper/unwrapLPs')

const v1_0_Pools = ['0x7Af4e1cE484f40D927b9C90fB6905Df4376fc3F6', '0xd7d974E81382D05E8D9fc6d0d17d0d852e9806dd']
const v1_1_LiquidityPool = [
    '0x2935CD347B79C319A6464fe3b1087170f142418C', 
    '0x69B4B35504a8c1d6179fef7AdDCDB37A8c663BC9', 
    '0x788843DE0Be1598155bFFaAB7Cfa2eCBd542E7f1'
]
const v1_1_ShortCollateral = [
    '0xE722F9aee66F649FBfc8CB0d4F906cb55803553c', 
    '0x585a72ccecde68dDFE5327B23134723a305D70F3', 
    '0x0A68E15f8E289b9f1Ad1BCAD524FeA30C6125c2D'
]

const pools = [...new Set([...v1_0_Pools, ...v1_1_LiquidityPool, ...v1_1_ShortCollateral].map(t=>t.toLowerCase()))]

const tokens = ['0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9', '0xe405de8f52ba7559f9df3c368500b6e6ae6cee49']

const L2toL1Synths = {
    '0xe405de8f52ba7559f9df3c368500b6e6ae6cee49': '0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb',
    '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9': '0x57ab1ec28d129707052df4df418d58a2d46d5f51',
    '0x298b9b95708152ff6968aafd889c6586e9169f1d': '0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6',
    '0xc5db22719a06418028a40a9b5e9a7c02959d0d08': '0xbbc455cb4f1b9e4bfc4b73970d360c8f032efee6'
}

async function tvl(ttimestamp, _b, chainBlocks){
    const balances = {}
    const block = await getBlock(ttimestamp, 'optimism', chainBlocks)
    const transform = (addr)=>{
        return L2toL1Synths[addr] || addr;
    }
    await sumTokens(balances, tokens.map(t=>pools.map(p=>[t,p])).flat(), block, 'optimism', transform)
    return balances
}

module.exports = {
    methodology: 'TVL counts the option market locked synth value, along with USDC in safety module.',
    optimism:{
        tvl
    },
    ethereum:{
        tvl: staking("0x54d59c4596c7ea66fd62188ba1e16db39e6f5472", "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "ethereum")
    },
 hallmarks:[
    [1635218174, "Lyra Token"],
    [1635822974, "Token Program Start"],
  ]
}
