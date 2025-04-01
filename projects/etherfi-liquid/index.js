const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')

const liquidVaults = [
  "0xf0bb20865277aBd641a307eCe5Ee04E79073416C",
  "0x08c6F91e2B681FaF5e17227F2a44C307b3C1364C"
]

const liquidAccountants = [
  "0x0d05D94a5F1E76C18fbeB7A13d17C8a314088198",
  "0xc315D6e14DDCDC7407784e2Caf815d131Bc1D3E7"
]

async function tvl(api) {
  const optimismApi = new sdk.ChainApi({ chain: 'optimism', timestamp: api.timestamp })
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

  //eth vault
  const balETH = await api.call({
    abi: "uint256:totalSupply",
    target: liquidVaults[0],
  });
  const ethQuote = await api.call({
    target: liquidAccountants[0],
    abi: 'function getRate() view returns (uint256)'
  });
  if (api.timestamp - updatedTimestamp > 12 * 60 * 60) {
    throw new Error('Data is outdated')
  }
  api.add(ADDRESSES.ethereum.EETH, BigInt(balETH) * BigInt(ethQuote) / BigInt(1e18) - BigInt(wethBal));
  api.add(ADDRESSES.ethereum.WETH, wethBal)
  //usdc vault
  const balUSD = await api.call({
    abi: "uint256:totalSupply",
    target: liquidVaults[1],
  });
  const usdQuote = await api.call({
    target: liquidAccountants[1],
    abi: 'function getRate() view returns (uint256)'
  });
  api.add(ADDRESSES.ethereum.USDC, balUSD * usdQuote / 1e6);
}

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl,
  },
};
