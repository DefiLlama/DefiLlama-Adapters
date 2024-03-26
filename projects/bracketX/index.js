const ADDRESSES = require('../helper/coreAssets.json')
const WETH_ARBITRUM = ADDRESSES.arbitrum.WETH;
const BRACKETX_PROXY_ARBITRUM = '0x12625Af4248E8137c6C58aed6eE804f8854669a6';

async function tvl(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: WETH_ARBITRUM,
    params: [BRACKETX_PROXY_ARBITRUM],
  });

  api.add(WETH_ARBITRUM, collateralBalance)
}

module.exports = {
      methodology: 'Count the number of WETH tokens locked in the protocol contract.',
  start: 1704412800,
  arbitrum: {
    tvl,
  }
}; 