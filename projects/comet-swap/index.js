const { uniV3Export } = require('../helper/uniswapV3')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

// =========================
// V2 (Uniswap V2-style)
// =========================
const v2Factory = '0x2a5d54C0E8B24e73D2b94fb1c1B1A61459F42a0D'
const v2FromBlock = 12168533

const pairCreatedAbi =
    'event PairCreated(address indexed token0, address indexed token1, address pair, uint)'

async function v2Tvl(api) {
    const logs = await getLogs({
        api,
        target: v2Factory,
        fromBlock: v2FromBlock,
        eventAbi: pairCreatedAbi,
        onlyArgs: true,
    })

    const ownerTokens = []
    logs.forEach(i => {
        ownerTokens.push([[i.token0, i.token1], i.pair])
    })

    return sumTokens2({ api, ownerTokens })
}

// =========================
// V3 / CLMM (Uniswap V3-style)
// =========================
const v3Config = {
    astar: {
        factory: '0x2C1EEf5f87F4F3194FdAAfa20aE536b1bA49863b',
        fromBlock: 12168518,
    },
}

module.exports = {
    methodology:
        'Counts the liquidity in all Comet Swap pools on Astar. ' +
        'Includes Uniswap V2-style pairs and Uniswap V3-style CLMM pools, ' +
        'summing token balances held by each pool.',

    // V2 TVL
    astar: {
        tvl: v2Tvl,
    },

    // V3 TVL
    ...uniV3Export(v3Config),
}
