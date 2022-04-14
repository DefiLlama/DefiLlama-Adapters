const sdk = require('@defillama/sdk');
const utils = require('../helper/utils')
const { unwrapCrv } = require('../helper/resolveCrvTokens');
const { unwrapUniswapLPs, sumTokens } = require('../helper/unwrapLPs');
const { bean_abi, unwrapCrvSimple } = require ("./bean-utils.js");
// const { getChainTransform } = require('../portedTokens')

const BEAN_DIA_ADDR = "0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5";

const BEAN_TOKEN_ADDR = "0xDC59ac4FeFa32293A95889Dc396682858d52e5Db";
const BEAN_ETH_ADDR = "0x87898263B6C5BABe34b4ec53F22d98430b91e371";

// To add new curve pools to the TVL:  
// add their LP token address and the number of tokens in the pool 
const BEAN_CRV_POOLS = [
    { addr: "0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D", numToken: 2 },
    { addr: "0x3a70DfA7d2262988064A2D051dd47521E43c9BdD", numToken: 2 },
]

async function tvl(time, ethBlock) {
    
    const beanBalance = (await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        chain: "ethereum",
        target: BEAN_TOKEN_ADDR,
        params: [BEAN_DIA_ADDR],
        block: 14582500,
    })).output;
    console.log("14582500:",beanBalance);
    const beanBalance2 = (await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        chain: "ethereum",
        target: BEAN_TOKEN_ADDR,
        params: [BEAN_DIA_ADDR],
        block: 14582544,
    })).output;
    console.log("14582544:",beanBalance2);
    const beanBalance3 = (await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        chain: "ethereum",
        target: BEAN_TOKEN_ADDR,
        params: [BEAN_DIA_ADDR],
        block: ethBlock,
    })).output;
    console.log("current:",beanBalance3);
    return {};
}

//tvl(0, 14579517);

// async function tvl(time, block){
//     const chain = "ethereum";
//     console.log("Calculating TVL for block", block);
//     const balances = {};

//     const beanPrice = await utils.getPrices({BEAN_TOKEN_ADDR : 'bean'});
//     console.log(beanPrice.data);

//     await sumTokens(balances, [[BEAN_TOKEN_ADDR, BEAN_DIA_ADDR]], block);
//     console.log(balances);

//     const beanEthLpBalance = (await sdk.api.abi.call({
//         abi: 'erc20:balanceOf',
//         target: BEAN_ETH_ADDR,
//         params: BEAN_DIA_ADDR,
//         block,
//         chain,
//     })).output;

//     const beanBalance = (await sdk.api.abi.call({
//         abi: 'erc20:balanceOf',
//         target: BEAN_TOKEN_ADDR,
//         params: BEAN_DIA_ADDR,
//         block: block,
//     })).output;
//     // console.log("Bean:Eth balance:", beanEthLpBalance2);

//     tokensAndOwners = [
//         [BEAN_TOKEN_ADDR, BEAN_DIA_ADDR],
//         [BEAN_ETH_ADDR, BEAN_DIA_ADDR],
//     ]

//     const balanceOfTokens = await sdk.api.abi.multiCall({
// 		calls: tokensAndOwners.map(t => ({
// 			target: t[0],
// 			params: t[1]
// 		})),
// 		abi: 'erc20:balanceOf',
// 		block,
// 		chain
// 	})

//     // const beanBalance = (await sdk.api.abi.call({
//     //     abi: bean_abi["totalDepositedBeans"],
//     //     chain: 'ethereum',
//     //     target: BEAN_DIA_ADDR,
//     //     block: block,
//     // })).output;
//     // console.log("Bean balance:", beanBalance);

//     // const beanEthLpBalance = (await sdk.api.abi.call({
//     //     abi: bean_abi["totalDepositedLP"],
//     //     target: BEAN_DIA_ADDR,
//     //     block: block,
//     // })).output;
//     // console.log("Bean:Eth balance:", beanEthLpBalance);

//     const lpPositions = [
//         {
//             balance: beanEthLpBalance,
//             token: BEAN_ETH_ADDR,
//         }
//     ]

//     // add balance of siloed Beans
//     await sdk.util.sumSingleBalance(balances, BEAN_TOKEN_ADDR, beanBalance);
//     console.log("Added Bean:",balances)
//     // add balance of siloed BEAN:ETH from uniswap pool
//     await unwrapUniswapLPs(balances, lpPositions, block);
//     console.log("Added BEAN:ETH LP:",balances)

//     if (block >= 14218934) {
//         // add balances of all siloed curve pools
//         // await Promise.all(BEAN_CRV_POOLS.map(async (pool) => {
//         //     const lpBalance = (await sdk.api.abi.call({
//         //         abi: bean_abi["getTotalDeposited"],
//         //         target: BEAN_DIA_ADDR,
//         //         params: pool.addr,
//         //         block: block,
//         //     })).output;
//         //     await unwrapCrvSimple(balances, pool.addr, lpBalance, block, "ethereum", pool.numToken);
//         // }));
//         await Promise.all(BEAN_CRV_POOLS.map(async (pool) => {
//             const lpBalance = (await sdk.api.abi.call({
//                 abi: 'erc20:balanceOf',
//                 target: pool.addr,
//                 params: BEAN_DIA_ADDR,
//                 block: block,
//             })).output;
//             await unwrapCrvSimple(balances, pool.addr, lpBalance, block, "ethereum", pool.numToken);
//         }));
        
//     }
//     console.log(balances);

//     return balances;
// }

module.exports={
    timetravel: true,
    methodology: "Counts all beans and current LPs in the silo.",
    start: 12974075,
    ethereum: {
        tvl,
    },
}