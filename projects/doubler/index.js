const ADDRESSES = require('../helper/coreAssets.json')

// arbitrum chain
const ARB_WETH_CONTRACT = ADDRESSES.arbitrum.WETH;
const ARB_PEPE_CONTRACT = '0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00';
const ARB_PEPE_POOL1_CONTRACT = '0x15AD6EDCa40dFAFE1B3BAc5F1c6d65411726F1bF';
const ARB_DOUBLER_POOL1_CONTRACT = '0x56386f04111057a5D8DF8d719827038B716333F0';
const ARB_DOUBLER_POOL2_CONTRACT = '0xC64a3f7da839F8851cB2A5710b693c92fA461027';

// manta chain
const MANTA_WETH_CONTRACT =  ADDRESSES.manta.WETH
const MANTA_MANTA_CONTRACT =  "0x95CeF13441Be50d20cA4558CC0a27B601aC544E5"
const MANTA_WETH_POOL_CONTRACT = "0xc8480647Eeb358df638Ca882362cE528cC666087"
const MANTA_MANTA_pool_CONTRACT = "0x498F4711a706F9ad33b5D68EaA20E56a87d5d926"


async function arbTvl(api) {
  // eth pool1,pool2
  const ethCollateralBalance1 = await api.call({
    abi: 'erc20:balanceOf',
    target: ARB_WETH_CONTRACT,
    params: [ARB_DOUBLER_POOL1_CONTRACT],
  });
  const ethCollateralBalance2 = await api.call({
    abi: 'erc20:balanceOf',
    target: ARB_WETH_CONTRACT,
    params: [ARB_DOUBLER_POOL2_CONTRACT],
  });
  api.add(ARB_WETH_CONTRACT, ethCollateralBalance1)
  api.add(ARB_WETH_CONTRACT, ethCollateralBalance2)

  // pepe pool1
  const pepeCollateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: ARB_PEPE_CONTRACT,
    params: [ARB_PEPE_POOL1_CONTRACT],
  });
  api.add(ARB_PEPE_CONTRACT, pepeCollateralBalance)
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