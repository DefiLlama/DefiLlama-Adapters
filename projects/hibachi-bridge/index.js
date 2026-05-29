const { sumTokensExport } = require('../helper/unwrapLPs');
const ADDRESSES = require ('../helper/coreAssets.json')

module.exports = {
    arbitrum: { tvl: sumTokensExport({ owner: '0x0E9C1a3AA696299E38b00a8144Bf6dc16C1F5400', tokens: [ADDRESSES.arbitrum.USDT] }) }
}
