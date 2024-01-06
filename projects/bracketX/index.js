const WETH_ARBITRUM = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
const BRACKETX_PROXY_ARBITRUM = '0x12625Af4248E8137c6C58aed6eE804f8854669a6';

async function tvl(_, _1, _2, { api }) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: WETH_ARBITRUM,
    params: [BRACKETX_PROXY_ARBITRUM],
  });

  api.add(WETH_ARBITRUM, collateralBalance)
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Count the number of WETH tokens locked in the protocol contract.',
  start: 1704412800,
  arbitrum: {
    tvl,
  }
}; 