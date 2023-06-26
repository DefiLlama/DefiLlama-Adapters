const ADDRESSES = require('../helper/coreAssets.json')
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

const v1_2_LiquidityPool = [
    '0x5Db73886c4730dBF3C562ebf8044E19E8C93843e',
    '0x3C73CD65D708A5C951f0Cc19a4D0Bb6559ae20c5',
    '0xA33C1963d74d203DF6bFfDfDa3bFf39a1D76e1D0'
    ]

const v1_2_ShortCollateral = [
    '0x3E86B53e1D7DA7eDbA225c3A218d0b5a7544fDfD',
    '0x26cf967e466d9fd60af7d1b78a01c43e75e03b32',
    '0xa5ce396616c7D14F61B5B9bbA3A57388Db885b2E'
    ]

const v1_3_arb_ShortCollateral = [
    '0xef4a92fcde48c84ef2b5c4a141a4cd1988fc73a9', //WETH
    '0x5a4842c0c1f81ebbae7bb3ec07edf7ae55aac631', //WBTC
    ]
const v1_3_arb_LiquidityPool = [
    '0xb619913921356904bf62aba7271e694fd95aa10d', //WETH
    '0xec6f3ef9481e7b8484290edbae2cedcdb0ce790e', //WBTC
    ]

const v2_op_ShortCollateral = [
    '0x8512028339bb67aee47c06a298031d91bb7d15ba', //WETH
    '0xa95c6d6a2765627a854960e9ee96f607b857385a', //WBTC
    '0x292a5929bd150d28eda3c17d9b7c754968b2899d', //OP
    '0xa49f2ea43b445f9a2467b7279cfa1f6a0c2e3f4f', //ARB
    ]
const v2_op_LiquidityPool = [
    '0xb8e90fd247700de65450aacd4a47b2948dc59fc1', //WETH
    '0xacacff03241256304e841e89c13319eae09f14b3', //WBTC
    '0x12a4fd54aa321eb16b45310ccb177bd87c6ae447', //OP
    '0xdd0d125475453767e65f1a4dd30b62699fdcc9f5', //ARB
    ]

const op_pools = [...new Set([...v1_0_Pools, ...v1_1_LiquidityPool, ...v1_1_ShortCollateral, ...v1_2_LiquidityPool, ...v1_2_ShortCollateral, ...v2_op_ShortCollateral, ...v2_op_LiquidityPool].map(t=>t.toLowerCase()))]

const arb_pools = [...new Set([...v1_3_arb_ShortCollateral, ...v1_3_arb_LiquidityPool].map(t=>t.toLowerCase()))]

const op_tokens = [ADDRESSES.optimism.sUSD, ADDRESSES.optimism.sETH,
    '0xc5db22719a06418028a40a9b5e9a7c02959d0d08', '0x298b9b95708152ff6968aafd889c6586e9169f1d', 
    ADDRESSES.optimism.OP, '0x68f180fcce6836688e9084f035309e29bf0a2095', 
    ADDRESSES.optimism.WETH, ADDRESSES.optimism.USDC]

const arb_tokens = [ADDRESSES.arbitrum.USDC, ADDRESSES.arbitrum.WETH,
    ADDRESSES.arbitrum.WBTC]

const L2toL1Synths = {
    [ADDRESSES.optimism.sETH]: '0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb',
    [ADDRESSES.optimism.sUSD]: ADDRESSES.ethereum.sUSD,
    '0x298b9b95708152ff6968aafd889c6586e9169f1d': '0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6',
    '0xc5db22719a06418028a40a9b5e9a7c02959d0d08': '0xbbc455cb4f1b9e4bfc4b73970d360c8f032efee6'
}

async function tvlOptimism(ttimestamp, _b, {optimism: block}){
    const balances = {}
    const transform = (addr)=>{
        return L2toL1Synths[addr] || addr;
    }
    await sumTokens(balances, op_tokens.map(t=>op_pools.map(p=>[t,p])).flat(), block, 'optimism')
    return balances
}

async function tvlArbitrum(ttimestamp, _b, {arbitrum: block}){
    const balances = {}
    await sumTokens(balances, arb_tokens.map(t=>arb_pools.map(p=>[t,p])).flat(), block, 'arbitrum')
    return balances
}

module.exports = {
    methodology: 'TVL counts the option market locked synth value, along with USDC in safety module.',
    optimism:{
        tvl:tvlOptimism
    },
    arbitrum:{
        tvl:tvlArbitrum
    },
    ethereum:{
        tvl: staking("0x54d59c4596c7ea66fd62188ba1e16db39e6f5472", ADDRESSES.ethereum.USDC, "ethereum"),
        staking: staking("0xcb9f85730f57732fc899fb158164b9ed60c77d49", "0x01ba67aac7f75f647d94220cc98fb30fcc5105bf", "ethereum")
    },
 hallmarks:[
    [1635218174, "Lyra Token"],
    [1635822974, "Token Program Start"],
    [1655341200, "Lyra V1.1 End"],
    [1656291600, "Lyra Avalon Start"],
    [1659560056, "OP Rewards Distribution Start"],
    [1675080000, "Launch on Arbitrum"]
  ]
}
