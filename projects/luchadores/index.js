const { staking } = require('../helper/staking');

// multisigs
const rewardPool_polygon = "0x72104d619BaEDf632936d9dcE38C089CA3bf12Dc";

//Contrat de staking, balancer, retro (matic/cash), aero, balanceof de la treso

// LPs
const WMATIC_LUCHA_Balancer_polygon = "0x924EC7ed38080E40396c46F6206A6d77D0B9f72d";

// staking
const luchaStk = "0xC5E9E8574c27747B4D537ef94e2448a3A0525dF4";
const luchaMaticBalancerStk = "0x1F0ee42D005b89814a01f050416b28c3142ac900";

// ERC20
const LUCHA_polygon = "0x6749441Fdc8650b5b5a854ed255C82EF361f1596";

module.exports = {
  polygon: {
    tvl: () => ({}),
    pool2: staking(luchaMaticBalancerStk, WMATIC_LUCHA_Balancer_polygon),
    staking: staking([luchaStk, rewardPool_polygon], LUCHA_polygon)
  },
  methodology: `- Staking : Players can stake their $LUCHA to earn $MASK and access in-game services or equipment.\r
    - Treasury : 100% of the funds collected during the first raffle (purchase of wearable) have been kept in treasury to build a long term economic strategy. Luchadores.io own 60% of LP token to improve liquidity and facilitate user swaps.\r
    - Reward Pool : 90% of the revenues generated in the game are redistributed to the players in this wallet (the 10% is shared between treasury and dev)\r`
}