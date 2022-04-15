const sdk = require('@defillama/sdk');
const utils = require('../helper/utils')
const { unwrapCrv } = require('../helper/resolveCrvTokens');
const { unwrapUniswapLPs, sumTokens } = require('../helper/unwrapLPs');
const { bean_abi, unwrapCrvSimple } = require ("./bean-utils.js");
// const { getChainTransform } = require('../portedTokens')

const BEAN_DIA_ADDR = "0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5";

const BEAN_TOKEN_ADDR = "0xdc59ac4fefa32293a95889dc396682858d52e5db";
const BEAN_ETH_ADDR = "0x87898263B6C5BABe34b4ec53F22d98430b91e371";

// To add new curve pools to the TVL:  
// add their LP token address and the number of tokens in the pool 
const BEAN_CRV_POOLS = [
    { addr: "0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D", numToken: 2 },
    { addr: "0x3a70DfA7d2262988064A2D051dd47521E43c9BdD", numToken: 2 },
]

async function tvl(time, block){
    const balances = {};

    const beanBalance = (await sdk.api.abi.call({
        abi: bean_abi["totalDepositedBeans"],
        chain: 'ethereum',
        target: BEAN_DIA_ADDR,
        block: block,
    })).output;

    const beanEthLpBalance = (await sdk.api.abi.call({
        abi: bean_abi["totalDepositedLP"],
        target: BEAN_DIA_ADDR,
        block: block,
    })).output;

    const lpPositions = [
        {
            balance: beanEthLpBalance,
            token: BEAN_ETH_ADDR,
        }
    ]

    // add balance of siloed Beans
    await sdk.util.sumSingleBalance(balances, BEAN_TOKEN_ADDR, beanBalance);
    // add balance of siloed BEAN:ETH from uniswap pool
    await unwrapUniswapLPs(balances, lpPositions, block);

    // this is the block when SiloV2Facet with getTotalDeposited() was introduced
    if (block >= 14218934) {
        // add balances of all siloed curve pools
        await Promise.all(BEAN_CRV_POOLS.map(async (pool) => {
            const lpBalance = (await sdk.api.abi.call({
                abi: bean_abi["getTotalDeposited"],
                target: BEAN_DIA_ADDR,
                params: pool.addr,
                block: block,
            })).output;
            // skip if there's a balance of 0 to avoid errors when curve pool doesn't exist yet in a block number
            if(lpBalance !== "0") {
                await unwrapCrvSimple(balances, pool.addr, lpBalance, block, "ethereum", pool.numToken);
            }
        }));
    }

    console.log(balances)
    return balances;
}

module.exports={
    timetravel: true,
    methodology: "Counts all beans and current LPs in the silo.",
    start: 12974077,
    ethereum: {
        tvl,
    },
}