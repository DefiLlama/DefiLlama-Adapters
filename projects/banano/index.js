const sdk = require("@defillama/sdk");
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')

const ownerPolygon = "0xefa4aED9Cf41A8A0FcdA4e88EfA2F60675bAeC9F"
const polygonLp = "0xb556feD3B348634a9A010374C406824Ae93F0CF8"

async function polygonTvl(timestamp, block, chainBlocks) {
    const balances = {}
    
    const lpBalance = await sdk.api.erc20.balanceOf({
        target: polygonLp,
        owner: ownerPolygon,
        block: chainBlocks.polygon,
        chain: 'polygon'
    })

    await unwrapUniswapLPs(balances, [{
        token: polygonLp,
        balance: lpBalance.output
    }], chainBlocks.polygon, 'polygon', addr=>`polygon:${addr}`)

  return balances;
}

ownerBsc = "0x1E30E12e82956540bf870A40FD1215fC083a3751";
// ENDED POOLS
// apeswapWbanBnb = "0x6011c6BAe36F2a2457dC69Dc49068a1E8Ad832DD";
// apeswapWbanBusd = "0x7898466CACf92dF4a4e77a3b4d0170960E43b896";
pancakeSwapWbanBusd = "0x351A295AfBAB020Bc7eedcB7fd5A823c01A95Fda";

const bscLps = [pancakeSwapWbanBusd];

async function bscTvl(timestamp, block, chainBlocks) {
    const balances = {}

    for(const pool of bscLps) {
        const lpBalance = await sdk.api.erc20.balanceOf({
            target: pool,
            owner: ownerBsc,
            block: chainBlocks.bsc,
            chain: 'bsc'
        })

        await unwrapUniswapLPs(balances, [{
            token: pool,
            balance: lpBalance.output
        }], chainBlocks.bsc, 'bsc', addr=>`bsc:${addr}`)
    }

    return balances;
}

module.exports = {
    polygon: {
        tvl: polygonTvl
    },
    bsc: {
        tvl: bscTvl
    },
    tvl: sdk.util.sumChainTvls([polygonTvl, bscTvl])
}
