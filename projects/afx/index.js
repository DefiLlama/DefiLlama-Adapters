const ADDRESSES = require('../helper/coreAssets.json')

const AFX_BRIDGE = '0xCb3B9A3E5668AFE84DC7A864B36b845dCE062e67'

async function tvl(api) {
  const usdc = ADDRESSES.arbitrum.USDC_CIRCLE
  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: usdc,
    params: [AFX_BRIDGE],
  })

  api.add(usdc, balance)
}

module.exports = {
  methodology: 'Counts USDC deposited through Arbitrum and locked in the AFX bridge contract.',
  arbitrum: {
    tvl,
  },
}
