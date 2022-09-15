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
const opThalesAmm = "0x5ae7454827d83526261f3871c1029792644ef1b1"
const opThalesLpToken = "0xac6705BC7f6a35eb194bdB89066049D6f1B0B1b5";
const opThalesToken = "0x217d47011b23bb961eb6d93ca9945b7501a5bb11"

const opSportsMarketsManager = "0xFBffEbfA2bF2cF84fdCf77917b358fC59Ff5771e"
const opSportsAmm = "0x170a5714112daEfF20E798B6e92e25B86Ea603C1"

const polygonMarketsManager = "0x85f1B57A1D3Ac7605de3Df8AdA056b3dB9676eCE"
const polygon_USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
const polygonThalesAmm = "0x9b6d76B1C6140FbB0ABc9C4a348BFf4e4e8a1213"

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

async function op_tvl(_time, block){
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

async function sports_tvl(_time, block){
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

async function polygon_tvl(_time, block){
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
        tvl: sdk.util.sumChainTvls([op_tvl, sports_tvl, // sUSD in all active markets
            staking(opThalesAmm, OP_SUSD, "optimism", ETH_SUSD),
            staking(opSportsAmm, OP_SUSD, "optimism", ETH_SUSD),
        ]),
        staking: staking(opThalesStaking, opThalesToken, "optimism", ETH_THALES), 
        pool2: guniPool2()
    },
    polygon:{
        tvl: sdk.util.sumChainTvls([polygon_tvl, // USDC in all active markets
            staking(polygonThalesAmm, polygon_USDC, "polygon", ETH_USDC),
        ])
    }
}