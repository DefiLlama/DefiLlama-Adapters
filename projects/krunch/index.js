const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

const KRUNCH_CONTRACT = '0xd3ca6e5035a3275909460EFC61d2A68DbEd3CE4c';

module.exports = {
  methodology: 'Gets the balance of the USDT invested in the protocol.',
  polygon: {
    tvl: sumTokensExport({ owner: KRUNCH_CONTRACT, tokens: [ADDRESSES.polygon.USDT] })
  }
}; 