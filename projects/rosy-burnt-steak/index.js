const { staking } = require("../helper/staking");

const ROSY_TOKEN_CONTRACT = '0x6665a6Cae3F52959f0f653E3D04270D54e6f13d8';
const STEAK_CONTRACT = '0x3e7ab819878bEcaC57Bd655Ab547C8e128e5b208';

module.exports = {
  methodology: 'counts the number of ROSY tokens in the Steak contract.',
  start: 1711020000,
  sapphire: {
    tvl: () => ({}),
    staking: staking(STEAK_CONTRACT, ROSY_TOKEN_CONTRACT)
  }
}; 