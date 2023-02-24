const { staking } = require('../helper/staking');
const { pool2s } = require('../helper/pool2');
const {sumTokensAndLPsSharedOwners} = require('../helper/unwrapLPs');
const {transformPolygonAddress} = require('../helper/portedTokens');

// multisigs
const treasury = "0x0Cb11b92Fa5C30eAfe4aE84B7BB4dF3034C38b9d";
const rewardPool = "0x72104d619BaEDf632936d9dcE38C089CA3bf12Dc";

// LPs
const LUCHA_MATIC_comethLp = "0x5e1cd1b923674e99df95ce0f910dcf5a58a3ca2d";
const LUCHA_MUST_comethLp = "0x98503d87aa4e9c84ff5d2e558295a0967fbbbeff";

// staking
const luchaStk = "0xC5E9E8574c27747B4D537ef94e2448a3A0525dF4";
const luchaMaticStk = "0x0d008974359e5aD1B64c4edc4de3C46ED662b6D8";
const luchaMustStk = "0xe11f861dD5cE8407bb24dFD13b9710c0295276D6";

// ERC20
const LUCHA_polygon = "0x6749441Fdc8650b5b5a854ed255C82EF361f1596";
const MATIC_polygon = "0x0000000000000000000000000000000000001010";
const QI_polygon = "0x580A84C73811E1839F75d86d75d88cCa0c241fF4";
const MUST_polygon = "0x9C78EE466D6Cb57A4d01Fd887D2b5dFb2D46288f";
const PSP_polygon = "0x42d61D766B85431666B39B89C43011f24451bFf6";
const LINK_polygon = "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39";
const WETH_polygon = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619";
const VQI_polygon = "0xB424dfDf817FaF38FF7acF6F2eFd2f2a843d1ACA";
const GHST_polygon = "0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7";
const RAIDER_polygon = "0xcd7361ac3307d1c5a46b63086a90742ff44c63b3";
const AURUM_polygon = "0x34d4ab47bee066f361fa52d792e69ac7bd05ee23";

async function tvl(time, ethBlock, chainBlocks){
    const balances = {};
    const transform = await transformPolygonAddress();
    await sumTokensAndLPsSharedOwners(balances, [
        [MATIC_polygon, false],
        [QI_polygon, false],
        [MUST_polygon, false],
        [PSP_polygon, false],
        [VQI_polygon, false],
        [LINK_polygon, false],
        [WETH_polygon, false],
        [GHST_polygon, false],
        [RAIDER_polygon, false],
        [AURUM_polygon, false],
    ], [treasury, luchaStk, rewardPool, luchaMaticStk, luchaMustStk], chainBlocks.polygon, "polygon", transform);
    return balances;
}

module.exports={
    timetravel: true,
    polygon:{
        tvl,
        staking: staking(luchaStk, LUCHA_polygon, "polygon"),
        pool2: pool2s([luchaMaticStk, luchaMustStk], [LUCHA_MATIC_comethLp, LUCHA_MUST_comethLp], "polygon")
    },
    methodology: `- Staking : Players can stake their $LUCHA to earn $MASK and access in-game services or equipment.\r
    - Treasury : 100% of the funds collected during the first raffle (purchase of wearable) have been kept in treasury to build a long term economic strategy. Luchadores.io own 60% of LP token to improve liquidity and facilitate user swaps.\r
    - Reward Pool : 90% of the revenues generated in the game are redistributed to the players in this wallet (the 10% is shared between treasury and dev)\r`
}