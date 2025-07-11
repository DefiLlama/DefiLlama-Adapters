const ADDRESSES = require('../helper/coreAssets.json')
const bnbUSD = "0x5519a479Da8Ce3Af7f373c16f14870BbeaFDa265";
const staticPoolStableToken = "0x55d398326f99059fF775485246999027B3197955" //usdt
const staticPoolYieldToken = "0x5519a479Da8Ce3Af7f373c16f14870BbeaFDa265" // bnbUSD
const staticPool = "0x2b9C1F069Ddcd873275B3363986081bDA94A3aA3" // sigma staticPool
const sy = "0x8B98563d66B74e5a644BFf78fC72c86bbA847a29" // sigma token 1:1 slisBNB
const slisBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B" // slisBNB
const poolManager = "0x0a43ca87954ED1799b7b072F6E9D51d88Cca600E"
const curveStaticPool = "0xe6e2905f54baf7625f4943b74c50338362741cd4" // curve usdt/bnbUSD static pool

module.exports = {
  doublecounted: true,
  bsc: {
    tvl,
  },
};

async function tvl(api) {
  const bnbUSDTvl = await api.call({
    abi: "erc20:totalSupply",
    target: bnbUSD,
  })
  api.add(bnbUSD, bnbUSDTvl)

  const staticPoolStableTokenTvl = await api.call({
    abi: "uint256:totalStableToken",
    target: staticPool,
  })
  api.add(staticPoolStableToken, staticPoolStableTokenTvl)

  const staticPoolYieldTokenTvl = await api.call({
    abi: "uint256:totalYieldToken",
    target: staticPool,
  })
  api.add(staticPoolYieldToken, staticPoolYieldTokenTvl)

  const syTvl = await api.call({
    abi: "erc20:balanceOf",
    target: sy,
    params: [poolManager],
  })
  api.add(slisBNB, syTvl)

  const curveTvl = await api.call({
    abi: "erc20:totalSupply",
    target: curveStaticPool
  })
  api.add(curveStaticPool, curveTvl)
}