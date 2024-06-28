const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

async function tvl(api) {
  const optimismApi = new sdk.ChainApi({ chain: 'optimism', timestamp: api.timestamp })
  const balETH = await api.call({
    abi: "uint256:totalAssets",
    target: '0xea1a6307d9b18f8d1cbf1c3dd6aad8416c06a221',
  });
  await optimismApi.getBlock()
  const wethBal = await optimismApi.call({
    target: '0xAB7590CeE3Ef1A863E9A5877fBB82D9bE11504da',
    abi: 'function categoryTVL(string _category) view returns (uint256)',
    params: ['liquid-weth']
  });
  const updatedTimestamp = await optimismApi.call({
    target: '0xAB7590CeE3Ef1A863E9A5877fBB82D9bE11504da',
    abi: 'function categoryLastUpdated(string _category) view returns (uint256)',
    params: ['liquid-weth']
  });
  if (api.timestamp - updatedTimestamp > 12 * 60 * 60 || updatedTimestamp > api.timestamp) {
    throw new Error('Data is outdated')
  }
  console.log(updatedTimestamp, api.timestamp)
  const balETH2 = await api.call({
    abi: "uint256:totalSupply",
    target: '0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88',
  });
  api.add(ADDRESSES.ethereum.EETH, BigInt(balETH) - BigInt(wethBal) + BigInt(balETH2));
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
