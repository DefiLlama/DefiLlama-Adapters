const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking');
const { pool2s } = require('../helper/pool2');
const {sumTokensAndLPsSharedOwners, sumBalancerLps, sumTokens2} = require('../helper/unwrapLPs');
const { getBlock } = require('../helper/http')
const { uniV3Export } = require("../helper/uniswapV3");
const sdk = require('@defillama/sdk');
const chain = {
    polygon: 'polygon',
    base: 'base'
}

// multisigs
const treasury_polygon = "0x0Cb11b92Fa5C30eAfe4aE84B7BB4dF3034C38b9d";
const rewardPool_polygon = "0x72104d619BaEDf632936d9dcE38C089CA3bf12Dc";
const treasury_base = "0xa715c8b17268f140D76494c12ec07B48218549C4";

//Contrat de staking, balancer, retro (matic/cash), aero, balanceof de la treso

// LPs
const LUCHA_WETH_aeroLp = "0x0D4953d2BDe145D316296CC72cCE509D899a5529";
const WMATIC_LUCHA_Balancer_polygon = "0x924EC7ed38080E40396c46F6206A6d77D0B9f72d";
const LUCHA_MATIC_retropLp = "0xde4C8898CD50EBE9C167313b312D147D10d1C898";
const LUCHA_CASH_retroLp = "0x5c09352B1aa703d18dbcF48c98655BFA19d07FBB";

// staking
const luchaStk = "0xC5E9E8574c27747B4D537ef94e2448a3A0525dF4";
const luchaMaticBalancerStk = "0x1F0ee42D005b89814a01f050416b28c3142ac900";

// ERC20
const LUCHA_polygon = "0x6749441Fdc8650b5b5a854ed255C82EF361f1596";
const LUCHA_base = "0xF4435cC8b478d54313F04c956882BE3D9aCf9F6F";
const WMATIC_polygon = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
const CASH_polygon = "0x5D066D022EDE10eFa2717eD3D79f22F949F8C175";
const WETH_base = ADDRESSES.base.WETH;

const polygonTvl = async (_, _block, chainBlocks) => {
    const balances = {};
    const balBalance = {};
    const block = await getBlock(_, chain.polygon, chainBlocks);
    const transform = i => `polygon:${i}`;
    
    // Balancer LP / Gauge
    await sumBalancerLps(balBalance, [[WMATIC_LUCHA_Balancer_polygon, luchaMaticBalancerStk]], block, chain.polygon, transform);
    
    // Retro + Treso + Rewards
    const owners = [
        LUCHA_MATIC_retropLp,
        LUCHA_CASH_retroLp,
        treasury_polygon,
        rewardPool_polygon
      ]
      const tokens = [
        LUCHA_polygon,
        WMATIC_polygon,
        CASH_polygon
    ]
    const retroTresoRewardBalance = await sumTokens2({chain: chain.polygon, block, owners, tokens});
    
    sdk.util.mergeBalances(balances, balBalance);
    sdk.util.mergeBalances(balances, retroTresoRewardBalance);

    return balances;
}

const baseTvl = async (_, _block, chainBlocks) => {
    const balances = {};
    const block = await getBlock(_, chain.base, chainBlocks);

    // Aero + Treso
    const owners = [
        LUCHA_WETH_aeroLp,
        treasury_base
      ]
      const tokens = [
        LUCHA_base,
        WETH_base
    ]
    const aeroTresoBalance = await sumTokens2({chain: chain.base, block, owners, tokens});
    
    sdk.util.mergeBalances(balances, aeroTresoBalance);

    return balances;
}

module.exports= {
    polygon: {  
        tvl: polygonTvl,
        staking: staking(luchaStk, LUCHA_polygon)
    },
    base: {
        tvl: baseTvl
    },
    methodology: `- Staking : Players can stake their $LUCHA to earn $MASK and access in-game services or equipment.\r
    - Treasury : 100% of the funds collected during the first raffle (purchase of wearable) have been kept in treasury to build a long term economic strategy. Luchadores.io own 60% of LP token to improve liquidity and facilitate user swaps.\r
    - Reward Pool : 90% of the revenues generated in the game are redistributed to the players in this wallet (the 10% is shared between treasury and dev)\r`
}