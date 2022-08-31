const sdk = require('@defillama/sdk');
const utils = require('../helper/utils')
const { sumTokens } = require('../helper/unwrapLPs');
const { unwrapCrvSimple } = require ("./bean-utils.js");

const BEAN_DIA_ADDR = "0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5";

const BEAN_TOKEN_ADDR = "0xdc59ac4fefa32293a95889dc396682858d52e5db";
const BEAN_ETH_ADDR = "0x87898263B6C5BABe34b4ec53F22d98430b91e371";

// To add new curve pools to the TVL:  
// add their LP token address and the number of tokens in the pool 
const BEAN_CRV_POOLS = [
    { addr: "0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D", numToken: 2 },
    { addr: "0x3a70DfA7d2262988064A2D051dd47521E43c9BdD", numToken: 2 },
];

async function staking(time, block) {
    const balances = {};
    // add balance of siloed Beans
    await sumTokens(balances, [[BEAN_TOKEN_ADDR, BEAN_DIA_ADDR]], block)

    return balances;
}

async function pool2(time, block) {
    const balances = {};

    // add balance of siloed BEAN:ETH from uniswap pool
    await sumTokens(balances, [[BEAN_ETH_ADDR, BEAN_DIA_ADDR]], block, undefined, undefined, { resolveLP: true  })

    // add balances of all siloed curve pools
    // this is the block when SiloV2Facet with getTotalDeposited() was introduced
    if (block >= 14218934) {
        await Promise.all(BEAN_CRV_POOLS.map(async (pool) => {
            const lpBalance = (await sdk.api.abi.call({
                abi: 'erc20:balanceOf',
                chain: 'ethereum',
                target: pool.addr,
                params: BEAN_DIA_ADDR,
                block: block,
            })).output;
            // skip if there's a balance of 0 to avoid errors when curve pool doesn't exist yet in a block number
            if(lpBalance !== "0") {
                await unwrapCrvSimple(balances, pool.addr, lpBalance, block, "ethereum", pool.numToken);
            }
        }));
    }

    return balances;
}

module.exports={
    timetravel: true,
    methodology: "Counts all beans and current LPs in the silo.",
    start: 12974077,
    ethereum: {
        tvl: async () => ({}),
        pool2,
        staking,
    },    
    hallmarks: [
        [1650153600, "Governance proposal hack"]
    ]
};