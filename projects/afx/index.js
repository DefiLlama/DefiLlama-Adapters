const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: 'Counts USDC deposited through Arbitrum and locked in the AFX bridge contract. AFX fees are generated from perpetual trading activity, excluding funding, with non-protocol allocations including referral rebates, trader rewards, Points Program rewards, and other incentive distributions. The Points Program rewards trading activity, AFX LP Vault participation, and Guild activity. See https://docs.afx.xyz and https://medium.com/@AFXTrade for more details.',
  arbitrum: { tvl: sumTokensExport({owner: '0xCb3B9A3E5668AFE84DC7A864B36b845dCE062e67', tokens: [ADDRESSES.arbitrum.USDC_CIRCLE]}) },
}
