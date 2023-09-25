const { getUniTVL } = require("../helper/unknownTokens");
const { stakingPricedLP } = require("../helper/staking");

const xSWORD = '0x11ef47783740B3F0c9736D54BE8eF8953C3Ead99'
const SWORD_TOKEN = '0x240f765Af2273B0CAb6cAff2880D6d8F8B285fa4'
const SWORD_WETH_LP = '0xc8b6b3a4d2d8428ef3a940eac1e32a7ddadcb0f1'

module.exports = {
  misrepresentedTokens: true,
  start: 1686309181,
  era: {
    tvl: getUniTVL({ factory: '0x15C664A62086c06D43E75BB3fddED93008B8cE63', useDefaultCoreAssets: true,fetchBalances: true, }),
    staking: stakingPricedLP(xSWORD,SWORD_TOKEN,'era',SWORD_WETH_LP,'weth')
  },
};