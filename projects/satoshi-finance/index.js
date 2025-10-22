const ADDRESSES = require('../helper/coreAssets.json')
const { getLiquityTvl } = require("../helper/liquity");
const { staking } = require("../helper/staking.js");

// Contract address to get total BTCB collateral deposited
const SATOSHI_TROVE_MANAGER = '0x3cd34afeba07c02443BECBb2840506F4230f84cB'
// Contract address for SATO staking
const SATOSHI_SATO_STAKING = '0x28c0e5160AB7B821A98745A3236aD2414F5dC041'
// Contract address for SATO token
const SATO = '0x708bAac4B235d3F62bD18e58c0594b8B20b2ED5B'
// Contract address of BTCB collateral
const BTCB = ADDRESSES.bsc.BTCB

module.exports = {
  bsc: {
    tvl: getLiquityTvl(SATOSHI_TROVE_MANAGER, {collateralToken: BTCB}),
    staking: staking(SATOSHI_SATO_STAKING, SATO)
  }
}