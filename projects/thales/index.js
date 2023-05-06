const sdk = require('@defillama/sdk')
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking')
const abi = require('./abi.json')
const { dodoPool2 } = require('../helper/pool2')

const ethMarketsManager = "0x5ed98Ebb66A929758C7Fe5Ac60c979aDF0F4040a"
const ETH_SUSD = "0x57ab1ec28d129707052df4df418d58a2d46d5f51"
const ETH_THALES = "0x8947da500eb47f82df21143d0c01a29862a8c3c5"
const ETH_WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const ETH_USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

const opMarketsManager = "0xBE086E0A2c588Ad64C8530048cE4356190D6a6F3"
const OP_SUSD = "0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9"
const opThalesStaking = "0xc392133eea695603b51a5d5de73655d571c2ce51"
const opThalesAmm = "0x278b5a44397c9d8e52743fedec263c4760dc1a1a"
const opRangedAmm = "0x2d356b114cbCA8DEFf2d8783EAc2a5A5324fE1dF"
const opParlayAmm = "0x82B3634C0518507D5d817bE6dAb6233ebE4D68D9"
const opSportsLp = "0x842e89b7a7eF8Ce099540b3613264C933cE0eBa5"
const opSportsVault = ["0x43d19841d818b2ccc63a8b44ce8c7def8616d98e", "0x5e2b49c68f1fd68af1354c377eacec2f05632d3f", "0x8285047f33c26c1bf5b387f2b07f21a2af29ace2", "0xbaac5464bf6e767c9af0e8d4677c01be2065fd5f", "0xc922f4CDe42dD658A7D3EA852caF7Eae47F6cEcd"]
const opAmmVault = ["0xb484027CB0c538538Bad2bE492714154f9196F93", "0x6c7Fd4321183b542E81Bcc7dE4DfB88F9DBca29F", "0x43318DE9E8f65b591598F17aDD87ae7247649C83"]
const opThalesLpToken = "0xac6705BC7f6a35eb194bdB89066049D6f1B0B1b5";
const opThalesToken = "0x217d47011b23bb961eb6d93ca9945b7501a5bb11"
const opSportsMarketsManager = "0xFBffEbfA2bF2cF84fdCf77917b358fC59Ff5771e"

const polygonMarketsManager = "0x85f1B57A1D3Ac7605de3Df8AdA056b3dB9676eCE"
const polygon_USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
const polygonThalesAmm = "0xd52B865584c25FEBfcB676B9A87F32683356A063"
const polygonRangedAMM = "0xe8e022405505a9F2b0B7452C844F1e64423849fC"

const arbitrumMarketsManager = "0x95d93c88c1b5190fA7FA4350844e0663e5a11fF0"
const arbitrum_USDC = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8"
const arbThalesStaking = "0x160Ca569999601bca06109D42d561D85D6Bb4b57"
const arbitrumThalesAMM = "0x2b89275efB9509c33d9AD92A4586bdf8c4d21505"
const arbSportsMarketsManager = "0x72ca0765d4bE0529377d656c9645600606214610"
const arbParlayAmm = "0x2Bb7D689780e7a34dD365359bD7333ab24903268"
const arbSportsLp = "0x8e9018b48456202aA9bb3E485192B8475822B874"
const arbSportsVault = ["0xfF7AEA98740fA1e2a9eB81680583e62aaFf1e3Ad", "0xE26374c7aFe71a2a6AB4A61080772547C43B87E6", "0xA852a651377fbE23f3d3acF5919c3D092aD4b77d", "0x31c2947c86412A5e33794105aA034DD9312eb711"]
const arbAmmVault = ["0x640c34D9595AD5351Da8c5C833Bbd1AfD20519ea", "0x0A29CddbdAAf56342507574820864dAc967D2683", "0x008A4e30A8b41781F5cb017b197aA9Aa4Cd53b46"]
const arbThalesToken = "0xE85B662Fe97e8562f4099d8A1d5A92D4B453bF30"

const L2toL1Synths = {
    //THALES
    "0x217d47011b23bb961eb6d93ca9945b7501a5bb11": ETH_THALES, 
    // sUSD
    "0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9": ETH_SUSD, 
    // WETH
    "0x4200000000000000000000000000000000000006": ETH_WETH,
    // USDC
    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174": ETH_USDC,
}

const transform = (addr)=>{
    return L2toL1Synths[addr] || addr;
}

async function eth_tvl(_time, block){
    const markets = await sdk.api.abi.call({
        target: ethMarketsManager,
        abi: abi.activeMarkets,
        block,
        params:[0, 1000]
    })
    const balances = {}
    await sumTokensAndLPsSharedOwners(balances, [[ETH_SUSD, false]], markets.output, block)
    return balances
}

async function op_tvl(_time, block, cb){
    block = cb.optimism
    const markets = await sdk.api.abi.call({
        target: opMarketsManager,
        abi: abi.activeMarkets,
        block,
        params:[0, 1000],
        chain: "optimism"
    })
    const balances = {}
    await sumTokensAndLPsSharedOwners(balances, [[OP_SUSD, false]], markets.output, block, "optimism", transform)
    return balances
}

async function op_sports_tvl(_time, block, cb){
    block = cb.optimism
    const markets = await sdk.api.abi.call({
        target: opSportsMarketsManager,
        abi: abi.activeMarkets,
        block,
        params:[0, 1000],
        chain: "optimism"
    })
    const balances = {}
    await sumTokensAndLPsSharedOwners(balances, [[OP_SUSD, false]], markets.output, block, "optimism", transform)
    return balances
}

async function op_sportsLp_tvl(_time, block, cb){
    block = cb.optimism
    const totalDeposited = await sdk.api.abi.call({
        target: opSportsLp,
        abi: abi.totalDeposited,
        block,
        chain: "optimism"
    })
    return {[ETH_SUSD]: totalDeposited.output}
}

async function polygon_tvl(_time, block, cb){
    block = cb.polygon
    const markets = await sdk.api.abi.call({
        target: polygonMarketsManager,
        abi: abi.activeMarkets,
        block,
        params:[0, 1000],
        chain: "polygon"
    })
    const balances = {}
    await sumTokensAndLPsSharedOwners(balances, [[polygon_USDC, false]], markets.output, block, "polygon")
    return balances
}

async function arbitrum_tvl(_time, block, cb){
    block = cb.arbitrum
    const markets = await sdk.api.abi.call({
        target: arbitrumMarketsManager,
        abi: abi.activeMarkets,
        block,
        params:[0, 1000],
        chain: "arbitrum"
    })
    const balances = {}
    await sumTokensAndLPsSharedOwners(balances, [[arbitrum_USDC, false]], markets.output, block, "arbitrum")
    return balances
}

async function arb_sports_tvl(_time, block, cb){
    block = cb.arbitrum
    const markets = await sdk.api.abi.call({
        target: arbSportsMarketsManager,
        abi: abi.activeMarkets,
        block,
        params:[0, 1000],
        chain: "arbitrum"
    })
    const balances = {}
    await sumTokensAndLPsSharedOwners(balances, [[arbitrum_USDC, false]], markets.output, block, "arbitrum")
    return balances
}

async function arb_sportsLp_tvl(_time, block, cb){
    block = cb.optimism
    const totalDeposited = await sdk.api.abi.call({
        target: arbSportsLp,
        abi: abi.totalDeposited,
        block,
        chain: "arbitrum"
    })
    return {[ETH_USDC]: totalDeposited.output}
}

function guniPool2(_time, chain="optimism") {
    return async (_timestamp, _ethBlock, chainBlocks) => {
        const block = chainBlocks[chain]
        const lp = await sdk.api.abi.call({
            target: opThalesLpToken,
            abi: abi.getUnderlyingBalance,
            block,
            chain: "optimism"
        })
        const balances = {}
        sdk.util.sumSingleBalance(balances, ETH_THALES, lp.output.amount0Current)
        sdk.util.sumSingleBalance(balances, ETH_WETH, lp.output.amount1Current)
        return balances
    }
}

module.exports={
    methodology: "sUSD/USDC locked on markets",
    ethereum:{
        tvl: eth_tvl,
        pool2: dodoPool2("0x136829c258e31b3ab1975fe7d03d3870c3311651", "0x031816fd297228e4fd537c1789d51509247d0b43")
    },
    optimism:{
        tvl: sdk.util.sumChainTvls([op_tvl, op_sports_tvl, op_sportsLp_tvl, // sUSD in all active markets
            staking([opThalesAmm, opParlayAmm, opRangedAmm, ...opSportsVault, ...opAmmVault], OP_SUSD, "optimism", ETH_SUSD),
        ]),
        staking: staking(opThalesStaking, opThalesToken, "optimism", ETH_THALES), 
        pool2: guniPool2()
    },
    polygon:{
        tvl: sdk.util.sumChainTvls([polygon_tvl, // USDC in all active markets
            staking([polygonThalesAmm, polygonRangedAMM], polygon_USDC, "polygon", ETH_USDC),
        ])
    },
    arbitrum:{
        tvl: sdk.util.sumChainTvls([arbitrum_tvl, arb_sports_tvl, arb_sportsLp_tvl, // USDC in all active markets
            staking([arbitrumThalesAMM, arbParlayAmm, ...arbSportsVault, ...arbAmmVault], arbitrum_USDC, "arbitrum", ETH_USDC),
        ]),
        staking: staking(arbThalesStaking, arbThalesToken, "arbitrum", ETH_THALES), 
    }
}
