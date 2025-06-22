const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking');
const { sumTokensExport } = require('../helper/unwrapLPs');

const MON_STAKING_POOL = "0x8Bc3702c35D33E5DF7cb0F06cb72a0c34Ae0C56F"; // deposits DCHF

const MON_TOKEN = "0x1EA48B9965bb5086F3b468E50ED93888a661fc17";

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owners: ['0x77E034c8A1392d99a2C776A6C1593866fEE36a33', '0xC1f785B74a01dd9FAc0dE6070bC583fe9eaC7Ab5'], tokens: [ADDRESSES.ethereum.WBTC, ADDRESSES.null]}),
    staking: staking(MON_STAKING_POOL, MON_TOKEN),
  },
  start: '2022-09-25',
    methodology:
    "Total deposits of ETH and wBTC for borrowed DCHF.",
};