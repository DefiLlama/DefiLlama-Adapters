const ADDRESSES = require('../helper/coreAssets.json')

const AFX_BRIDGE = '0xCb3B9A3E5668AFE84DC7A864B36b845dCE062e67'

async function tvl(api) {
  return api.sumTokens({
    owner: AFX_BRIDGE,
    tokens: [ADDRESSES.arbitrum.USDC_CIRCLE],
  })
}

module.exports = {
  methodology: 'Counts Arbitrum USDC locked in the AFX bridge/custody contract for AFX L1 deposits.',
  arbitrum: { tvl },
}
