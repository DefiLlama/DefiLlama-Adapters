const sdk = require("@defillama/sdk");
const {getLiquityTvl} = require('../helper/liquity')
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");


const TROVE_MANAGER_ADDRESS = "0xd22b04395705144Fd12AfFD854248427A2776194";
const STAKING_CONTRACT = "0xb4387D93B5A9392f64963cd44389e7D9D2E1053c";
const TEDDY_TOKEN = "0x094bd7b2d99711a1486fb94d4395801c6d0fddcc";

const POOL2_STAKING_CONTRACT = "0x9717Ff7406Be065EA177bA9ab1bE704060Af8370";
const WAVAX_TSD_LP_TOKEN = "0x67E395B6ACd948931eeE8F52C7c1Fe537E7f1a7a";



module.exports = {
  methodology:
    "Counts total AVAX collateral locked in Teddy Cash troves as TVL, " +
    "plus TEDDY tokens staked in the staking contract, and liquidity pool tokens staked in the WAVAX-TSD LP pool on Avalanche.",
  avalanche: {
    tvl: getLiquityTvl(TROVE_MANAGER_ADDRESS),
    staking: staking(STAKING_CONTRACT, TEDDY_TOKEN),
    pool2: pool2(POOL2_STAKING_CONTRACT, WAVAX_TSD_LP_TOKEN),
  },
  timetravel: true,
  start: 1630003200 //August 26, 2021, 00:00:00 UTC 
};
