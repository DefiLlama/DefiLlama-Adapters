const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

async function tvl(api) {
  const optimismApi = new sdk.ChainApi({ chain: 'optimism' })
  const balETH = await api.call({
    abi: "uint256:totalAssets",
    target: '0xea1a6307d9b18f8d1cbf1c3dd6aad8416c06a221',
  });
  await optimismApi.getBlock()
  const wethBal = await optimismApi.call({
    target: '0x72Dbdd6B57934339C36F850a4bDAeD8E488E7062',
    abi: 'function categoryTVL(string _category) view returns (uint256)',
    params: ['liquid-weth']
  });
  api.add(ADDRESSES.ethereum.EETH, balETH-wethBal);
  api.add(ADDRESSES.ethereum.WETH, wethBal)
  const balUSD = await api.call({
    abi: "uint256:totalSupply",
    target: '0x08c6f91e2b681faf5e17227f2a44c307b3c1364c',
  });
  api.add(ADDRESSES.ethereum.USDC, balUSD);
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  },
};
