const USDC_TOKEN_CONTRACT = '0xB833E8137FEDf80de7E908dc6fea43a029142F20';
const WTAO_TOKEN_CONTRACT = '0x9Dc08C6e2BF0F1eeD1E00670f80Df39145529F81';
const POOL = '0x6647dcbeb030dc8E227D8B1A2Cb6A49F3C887E3c'

async function tvl(api) {
  const usdcBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: USDC_TOKEN_CONTRACT,
    params: [POOL],
  });
  const wtaoBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: WTAO_TOKEN_CONTRACT,
    params: [POOL],
  });

  api.add(USDC_TOKEN_CONTRACT, usdcBalance)
  api.add(WTAO_TOKEN_CONTRACT, wtaoBalance)
}

module.exports = {
  methodology: 'counts the number of USDC/sTAO tokens of the uni v3 pool.',
  bittensor_evm: {
    tvl,
  }
}; 