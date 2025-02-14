const { sumTokensExport } = require("../helper/unwrapLPs")

// POOLS
const REWARDS_POOLS_NOME_HOMEY_LP = '0xf4399d583d8dad39399ea6a99ca218290595aedc'
const REWARDS_POOLS_USDbr_HONEY_LP = '0x422bd07acb1f7fa86682fcf211554ca500d0be78'
const LIQUIDE_BOARDROOM = '0x50caa9627a940bcd4d5f3c3ed231252425af50cf'
const STAB_FUND = '0xff491a00b12be29413a2b29c2499cac50e4ec35a'

// TOKENS
const NOME_TOKEN = '0xfaf4c16847bd0ebac546c49a9c9c6b81abd4b08c'

// LP POOLS
const NOME_HOMEY_LP = '0x54270bea720a79db0a34645053b02740ebcbfad5'
const USDbr_HONEY_LP = '0xb1f0c3a875512191eb718b305f192dc19564f513'


async function tvl(api) {
  const tokens = await api.call({  abi: 'address[]:allAllowedTokens', target: STAB_FUND})
  return api.sumTokens({ owner: STAB_FUND, tokens})
}

module.exports = {
  berachain: { 
    tvl,
    pool2: sumTokensExport({ owners: [REWARDS_POOLS_NOME_HOMEY_LP, REWARDS_POOLS_USDbr_HONEY_LP], tokens: [NOME_HOMEY_LP, USDbr_HONEY_LP] }),
    staking: sumTokensExport({ owners: [LIQUIDE_BOARDROOM], tokens: [NOME_TOKEN] }),
  }
}