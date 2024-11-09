const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

async function tvl(api) {
  const optimismApi = new sdk.ChainApi({ chain: 'optimism', timestamp: api.timestamp })
  const balETH = await api.call({
    abi: "uint256:totalSupply",
    target: '0xf0bb20865277aBd641a307eCe5Ee04E79073416C',
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
  api.add(ADDRESSES.ethereum.EETH, BigInt(balETH) - BigInt(wethBal));
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
