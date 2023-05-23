const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");

const CRA = "0xa32608e873f9ddef944b24798db69d80bbb4d1ed";

const treasuryContracts = [
  //mains treasury
  "0x96DD95307295e2f72E6382Fc5130F1A8DB74042C",
  // Breeding fees
  "0x4e57A39Cac2499aBeafd3698F7164eCBFde008eE",
  // Marketplace fees
  "0x49F6fC3f882e2Cd915E38bA377f8e977c11e0F66",
  // Tavern fees
  "0x2BA9033E49EC1aa030fA46DE6d6793983945497E",
];

const lpTokens = [
  "0xf693248F96Fe03422FEa95aC0aFbBBc4a8FdD172", //TUS
  "0x140CAc5f0e05cBEc857e65353839FddD0D8482C1", // WAVAX-CRA JLP
  "0x565d20BD591b00EAD0C927e4b6D7DD8A33b0B319", // WAVAX-TUS JLP
  "0x21889033414f652f0fD0e0f60a3fc0221d870eE4", // CRA-TUS JLP
  "0x134905461773eF228b66CEBd5E1FF06D7CC79B12", // TUS-CRAM JLP
  ADDRESSES.avax.USDC_e // USDC
];

module.exports = {
  avax: {
    tvl: staking(treasuryContracts, lpTokens),
    ownTokens: staking(treasuryContracts, [CRA]),
  },
};
