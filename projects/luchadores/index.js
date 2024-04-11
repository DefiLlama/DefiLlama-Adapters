const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking');
const { pool2s } = require('../helper/pool2');
const {sumTokensAndLPsSharedOwners} = require('../helper/unwrapLPs');

// multisigs
const treasury = "0x0Cb11b92Fa5C30eAfe4aE84B7BB4dF3034C38b9d";
const rewardPool = "0x72104d619BaEDf632936d9dcE38C089CA3bf12Dc";

// LPs
const LUCHA_MATIC_comethLp = "0x5e1cd1b923674e99df95ce0f910dcf5a58a3ca2d";
const LUCHA_MUST_comethLp = "0x98503d87aa4e9c84ff5d2e558295a0967fbbbeff";
const LUCHA_MATIC_satinLp = "0x989e0df932e742ac52f82f5da1b0b70bdce3ed5f";
const LUCHA_CASH_satinLp = "0x55f70935f4e8dd194bc2d56fb1c4d25db599cbc5";

// staking
const luchaStk = "0xC5E9E8574c27747B4D537ef94e2448a3A0525dF4";
const luchaMaticStk = "0x0d008974359e5aD1B64c4edc4de3C46ED662b6D8";
const luchaMustStk = "0xe11f861dD5cE8407bb24dFD13b9710c0295276D6";

// ERC20
const LUCHA_polygon = "0x6749441Fdc8650b5b5a854ed255C82EF361f1596";
const MATIC_polygon = ADDRESSES.polygon.WMATIC_1;
const QI_polygon = "0x580A84C73811E1839F75d86d75d88cCa0c241fF4";
const MUST_polygon = "0x9C78EE466D6Cb57A4d01Fd887D2b5dFb2D46288f";
const PSP_polygon = "0x42d61D766B85431666B39B89C43011f24451bFf6";
const LINK_polygon = "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39";
const WETH_polygon = ADDRESSES.polygon.WETH_1;
const WMATIC_LUCHA_Balancer_polygon = "0x924EC7ed38080E40396c46F6206A6d77D0B9f72d";

async function tvl(time, ethBlock, chainBlocks){
    const balances = {};
    const transform = i => `polygon:${i}`;
    await sumTokensAndLPsSharedOwners(balances, [
        // [LUCHA_polygon, false],
        [MATIC_polygon, false],
        [QI_polygon, false],
        [MUST_polygon, false],
        [PSP_polygon, false],
        [LINK_polygon, false],
        [WETH_polygon, false],
        [WMATIC_LUCHA_Balancer_polygon, false],
        [LUCHA_MATIC_comethLp, true],
        [LUCHA_MUST_comethLp, true],
        [LUCHA_MATIC_satinLp, true],
        [LUCHA_CASH_satinLp, true]
    ], [treasury, luchaStk, rewardPool, luchaMaticStk, luchaMustStk, LUCHA_MATIC_satinLp, LUCHA_CASH_satinLp], chainBlocks.polygon, "polygon", transform);
    return balances;
}

module.exports={
        polygon:{
        tvl,
        staking: staking(luchaStk, LUCHA_polygon),
        pool2: pool2s([luchaMaticStk, luchaMustStk], [LUCHA_MATIC_comethLp, LUCHA_MUST_comethLp, LUCHA_MATIC_satinLp, LUCHA_CASH_satinLp])
    },
    methodology: `- Staking : Players can stake their $LUCHA to earn $MASK and access in-game services or equipment.\r
    - Treasury : 100% of the funds collected during the first raffle (purchase of wearable) have been kept in treasury to build a long term economic strategy. Luchadores.io own 60% of LP token to improve liquidity and facilitate user swaps.\r
    - Reward Pool : 90% of the revenues generated in the game are redistributed to the players in this wallet (the 10% is shared between treasury and dev)\r`
}