const { staking } = require('../helper/staking');
const ETH_TOKEN_ADDRESS = '0x2eDf094dB69d6Dcd487f1B3dB9febE2eeC0dd4c5';
const ETH_STAKING_ADDRESS = '0xEDF822c90d62aC0557F8c4925725A2d6d6f17769';
const BSC_TOKEN_ADDRESS = '0x44754455564474A89358B2C2265883DF993b12F0';
const BSC_STAKING_ADDRESS = '0x593497878c33dd1f32098E3F4aE217773F803cf3';
const POLY_TOKEN_ADDRESS = '0xfd4959c06fbcc02250952daebf8e0fb38cf9fd8c';
const POLY_STAKING_ADDRESS = '0x89eA093C07f4FCc03AEBe8A1D5507c15dE88531f';
const AVAX_TOKEN_ADDRESS = '0x44754455564474A89358B2C2265883DF993b12F0'
const AVAX_STAKING_ADDRESS = '0xa4751EAa89C5D6ff61384766268cabf25aCD1011'

module.exports = {
  methodology: 'Counts tvl of all the tokens staked through Staking Contracts',
  start: 1000235,
  ethereum: {
    tvl:() => ({}),
    staking: staking(ETH_STAKING_ADDRESS, ETH_TOKEN_ADDRESS),
  },
  bsc: {
    staking: staking(BSC_STAKING_ADDRESS, BSC_TOKEN_ADDRESS),
  },
  polygon: {
    staking: staking(POLY_STAKING_ADDRESS, POLY_TOKEN_ADDRESS)
  },
  avax: {
    staking: staking(AVAX_STAKING_ADDRESS, AVAX_TOKEN_ADDRESS)
  }
};

