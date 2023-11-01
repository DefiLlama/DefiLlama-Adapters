const { compoundExports2 } = require('../helper/compound')
const { mergeExports } = require('../helper/utils')
const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = mergeExports([{
  base: compoundExports2({ comptroller: '0xbA47ccbE10B6addD8385748311a4a9478e74F38D', cether: '0x540EE31b264e8823e01795AA424fE89554672dc1', blacklistedTokens: ['0x5c185329bc7720aebd804357043121d26036d1b3'] }),
}, {
  base: {
    tvl: sumTokensExport({ owner: '0x594368C1A1A733581A546a4ac46bF1962547f427', tokens: [ADDRESSES.base.DAI],}),
    pool2: sumTokensExport({ owner: '0x23014067c5bab5f89d3f97727c06afbffb4867c8', tokens: ['0x6eda0a4e05ff50594e53dbf179793cadd03689e5'], resolveLP: true, }),
    staking: sumTokensExport({ owner: '0x0fb339fe0ad874758e2e9c9d679772c61bd6804b', tokens: ['0x4788de271F50EA6f5D5D2a5072B8D3C61d650326'],}),
  }
}])