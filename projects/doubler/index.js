const ARB_WETH_CONTRACT = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';
const ARB_DOUBLER_CONTRACT = '0x56386f04111057a5D8DF8d719827038B716333F0';

const MANTA_WETH_CONTRACT =  "0x0Dc808adcE2099A9F62AA87D9670745AbA741746"
const MANTA_MANTA_CONTRACT =  "0x95CeF13441Be50d20cA4558CC0a27B601aC544E5"
const MANTA_WETH_POOL_CONTRACT = "0xc8480647Eeb358df638Ca882362cE528cC666087"
const MANTA_MANTA_pool_CONTRACT = "0x498F4711a706F9ad33b5D68EaA20E56a87d5d926"


async function arbTvl(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: ARB_WETH_CONTRACT,
    params: [ARB_DOUBLER_CONTRACT],
  });
  api.add(ARB_WETH_CONTRACT, collateralBalance)
}

async function mantaTvl(api) {
  const ethCollateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: MANTA_WETH_CONTRACT,
    params: [MANTA_WETH_POOL_CONTRACT],
  });
  api.add(MANTA_WETH_CONTRACT, ethCollateralBalance)
  const mantaCollateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: MANTA_MANTA_CONTRACT,
    params: [MANTA_MANTA_pool_CONTRACT],
  });
  api.add(MANTA_MANTA_CONTRACT, mantaCollateralBalance)
}

module.exports = {
  arbitrum: {
    tvl:arbTvl,
  },
  manta: {
    tvl:mantaTvl,
  },
};