const { getUniTVL } = require('../helper/unknownTokens');
const { stakings } = require("../helper/staking");

const stakingContracts = [
  "0x00801Df22566E6F1b7Eb2DCaa2c794ca6daD3D0A",
  "0xcF17abb2CeA7e96eD1E35E0F3FAC919cFECad2F3",
];

const lfgToken = "0xf7a0b80681ec935d6dd9f3af9826e68b99897d6d";


module.exports = {
  misrepresentedTokens: true,
  core: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0xA1ADD165AED06D26fC1110b153ae17a5A5ae389e',
    }),
    //staking: stakings(stakingContracts, lfgToken, 'core', undefined, 18)
  }
};