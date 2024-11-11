const ADDRESSES = require('../helper/coreAssets.json')
const WETH_CONTRACT = ADDRESSES.arbitrum.WETH;
const DOUBLER_CONTRACT = '0x56386f04111057a5D8DF8d719827038B716333F0';

async function tvl(api) {
  const collateralBalance = await api.call({
    abi: 'erc20:balanceOf',
    target: WETH_CONTRACT,
    params: [DOUBLER_CONTRACT],
  });
  api.add(WETH_CONTRACT, collateralBalance)
}

module.exports = {
  arbitrum: {
    tvl,
  }
};