const { sumTokens } = require('../helper/unwrapLPs');

const BEAN_DIA_ADDR = "0xC1E088fC1323b20BCBee9bd1B9fC9546db5624C5";

const BEAN_TOKEN_ADDR = "0xdc59ac4fefa32293a95889dc396682858d52e5db";
const NEW_BEAN_TOKEN_ADDR = "0xBEA0000029AD1c77D3d5D23Ba2D8893dB9d1Efab";
const BEAN_ETH_ADDR = "0x87898263B6C5BABe34b4ec53F22d98430b91e371";

// To add new curve pools to the TVL:  
// add their LP token address and the number of tokens in the pool 
const BEAN_CRV_POOLS = [
    { addr: "0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D", numToken: 2 },
    { addr: "0x3a70DfA7d2262988064A2D051dd47521E43c9BdD", numToken: 2 },
    { addr: "0xc9C32cd16Bf7eFB85Ff14e0c8603cc90F6F2eE49", numToken: 2 }
];

async function staking(time, block) {
    const balances = {};
    // add balance of siloed Beans
    await sumTokens(balances, [[NEW_BEAN_TOKEN_ADDR,BEAN_TOKEN_ADDR,],[NEW_BEAN_TOKEN_ADDR, BEAN_DIA_ADDR] ], block)

    return balances;
}

async function pool2(time, block) {
    const balances = {};

    // add balance of siloed BEAN:ETH from uniswap pool
    const toa = [[BEAN_ETH_ADDR, BEAN_DIA_ADDR]]

    // add balances of all siloed curve pools
    // this is the block when SiloV2Facet with getTotalDeposited() was introduced
    if (block >= 14218934) {
        BEAN_CRV_POOLS.forEach(i => toa.push([i.addr, BEAN_DIA_ADDR]))
    }

    return sumTokens(balances, toa, block,)
}

module.exports={
    doublecounted: true,
    methodology: "Counts all beans and current LPs in the silo.",
    start: 12974077,
    ethereum: {
        tvl: async () => ({}),
        pool2,
        staking,
    },    
    hallmarks: [
        [1650153600, "Governance proposal hack"],
        [1659602715, "Replant"]
    ]
};