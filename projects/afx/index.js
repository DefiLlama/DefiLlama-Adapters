const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: 'Counts USDC deposited through Arbitrum and locked in the AFX bridge contract.',
  arbitrum: { tvl: sumTokensExport({owner: '0xCb3B9A3E5668AFE84DC7A864B36b845dCE062e67', tokens: [ADDRESSES.arbitrum.USDC_CIRCLE]}) },
}
