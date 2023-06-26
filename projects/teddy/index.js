const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const {getLiquityTvl} = require('../helper/liquity')

const treasuryContract = "0xb4Fbc7839ce88029c8c1c6274660118e27B6f982";

const stakingContract = "0xb4387D93B5A9392f64963cd44389e7D9D2E1053c";
const TEDDY = "0x094bd7b2d99711a1486fb94d4395801c6d0fddcc";

const stakingPool2Contract = "0x9717Ff7406Be065EA177bA9ab1bE704060Af8370";
const WAVAX_TSD_PGL = "0x67E395B6ACd948931eeE8F52C7c1Fe537E7f1a7a";

const NATIVE_ADDRESS = ADDRESSES.avax.WAVAX;
//const LUSD_TOKEN_ADDRESS = ADDRESSES.ethereum.LUSD;

const TROVE_MANAGER_ADDRESS = "0xd22b04395705144Fd12AfFD854248427A2776194";

module.exports = {
  avax: {
    staking: sdk.util.sumChainTvls([
      staking(stakingContract, TEDDY, "avax"),
      //staking(STABILITY_POOL_ADDRESS, TSD, "avax"),
    ]),
    pool2: pool2(stakingPool2Contract, WAVAX_TSD_PGL, "avax"),
    tvl: getLiquityTvl(NATIVE_ADDRESS,TROVE_MANAGER_ADDRESS,"avax"),
  },
  methodology:
    "Get tokens on stability pool and troves, TSD has been replaced by LUSD",
};
