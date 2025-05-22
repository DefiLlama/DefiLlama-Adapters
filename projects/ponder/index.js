const { getUniTVL } = require("../helper/unknownTokens");
const { staking } = require('../helper/staking');

// Addresses on Bitkub Chain (Chain ID: 96)
const addresses = {
  Factory: '0x20b17e92dd1866ec647acaa38fe1f7075e4b359e',
  PonderToken: '0xe0432224871917fb5a137f4a153a51ecf9f74f57',
  PonderStaking: '0x6c8119d33fd43f6b254d041cd5d2675586731dd5'
};

module.exports = {
  methodology: 'TVL includes the liquidity in all Ponder trading pairs on Bitkub Chain. Staking counts PONDER tokens locked in the staking contract.',
  start: 1704067200, // January 1, 2024 (approximate launch date)
  bitkub: {
    tvl: getUniTVL({
      factory: addresses.Factory,
      useDefaultCoreAssets: true,
      fetchBalances: true,
    }),
    staking: staking(addresses.PonderStaking, addresses.PonderToken, "bitkub", addresses.PonderToken)
  }
};