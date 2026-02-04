const ADDRESSES = require('../helper/coreAssets.json')
const contracts = {
  "ftmVault": "0x3d2fa78f5e1aa2e7f29c965d0e22b32b8d5f14a9",
  "tombVault": "0xA222fb9D2A811FAb3B334a5a9FA573C11fee73c1",
  "avaxVault": "0x1689D5C5866909569a98B35da6A24090e4931C17",
  "ethVault": "0xf9448f9a932474B5cAd9F05b86EA12376f2Fd770",
  "pool2": "0x56995c729296c634cA367F8F3e5E5dEFF30D4511",
  "daiPool2": "0x629670EAA62952990dd5b0658Ab6c6296fE2111b",
  "ftmPool2": "0x4bd9B32677821939937FaDaEb30858806578339c"
}

const { staking } = require("../helper/staking");

async function tvl(api) {
  return api.sumTokens({
    tokensAndOwners: [
      [ADDRESSES.fantom.WFTM, contracts.ftmVault],
      ['0x74b23882a30290451A17c44f4F05243b6b58C76d', contracts.ethVault],
      ['0x511D35c52a3C244E7b8bd92c0C297755FbD89212', contracts.avaxVault],
      ['0x6c021ae822bea943b2e66552bde1d2696a53fbb7', contracts.tombVault],
      [ADDRESSES.fantom.DAI, contracts.ftmVault],
      [ADDRESSES.fantom.DAI, contracts.ethVault],
      [ADDRESSES.fantom.DAI, contracts.avaxVault],
      [ADDRESSES.fantom.DAI, contracts.tombVault],
    ]
  })
}

module.exports = {
  fantom: {
    tvl,
    // hitting pool2 staking contract twice while stake1 isnt on coingecko
    pool2: staking(
      [contracts.pool2], 
      [contracts.daiPool2, contracts.ftmPool2], 
      )
  }
}; // node test.js projects/stake1/index.js
