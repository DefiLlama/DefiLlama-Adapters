const { getLiquityTvl } = require('../helper/liquity')
const { staking } = require("../helper/staking.js");

const BASE_STAKING_ADDRESS = "0xfCcD02F7a964DE33032cb57746DC3B5F9319eaB7"
const BASE_MST_ADDRESS = "0x2F3b1A07E3eFb1fCc64BD09b86bD0Fa885D93552"

const TELOS_STAKING_ADDRESS = ["0x493A60387522a7573082f0f27B98d78Ca8635e43", "0xE07D7f1C1153bCebc4f772C48A8A8eed1283ecCE"];
const TELOS_MST_ADDRESS = "0x568524DA340579887db50Ecf602Cd1BA8451b243"

const FUSE_STAKING_ADDRESS = "0xb513fE4E2a3ed79bE6a7a936C7837f0294AFFEAd";
const FUSE_MST_ADDRESS = "0x2363Df84fDb7D4ee9d4E1A15c763BB6b7177eAEe"

module.exports = {
  methodology: "Deposited Collateral on Meridian Mint",
  base: { 
    tvl: getLiquityTvl("0x56a901FdF67FC52e7012eb08Cfb47308490A982C"),
    staking: staking(BASE_STAKING_ADDRESS, BASE_MST_ADDRESS)
  },
  telos: { 
    tvl: getLiquityTvl("0xb1F92104E1Ad5Ed84592666EfB1eB52b946E6e68"),
    staking: staking(TELOS_STAKING_ADDRESS, TELOS_MST_ADDRESS)
   },
  fuse: { 
    tvl: getLiquityTvl("0xCD413fC3347cE295fc5DB3099839a203d8c2E6D9"),
    staking: staking(FUSE_STAKING_ADDRESS, FUSE_MST_ADDRESS)
   },
  tara: { tvl: getLiquityTvl("0xd2ff761A55b17a4Ff811B262403C796668Ff610D") },
  artela: { tvl: getLiquityTvl("0xd2ff761A55b17a4Ff811B262403C796668Ff610D") },
};

//const { getLiquityTvl } = require("../helper/liquity.js");



