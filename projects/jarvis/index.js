const sdk = require("@defillama/sdk");

const usdcToken = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const synthCollateralContracts = ['0x48546bdd57d34cb110f011cdd1ccaae75ee17a70','0x182d5993106573a95a182ab3a77c892713ffda56','0x496b179d5821d1a8b6c875677e3b89a9229aab77']
const liquidityPools = ['0x833407f9c6C55df59E7fe2Ed6fB86bb413536359', '0x2D8b421F3C6F14Df2887dce70b517d87d11af1E0', '0x6FF556740b30dFb092602dd5721F6D42c66A1580'] // Not AMM LP pools, just pools where money is waiting to be used for minting

async function tvl(timestamp, block) {
  let balances = {};

  const collateralTokens = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: synthCollateralContracts.concat(liquidityPools).map(contract=>({
      target: usdcToken,
      params: [contract]
    })),
    block
  })
  sdk.util.sumMultiBalanceOf(balances, collateralTokens)
  return balances
}
  

module.exports = {
  name: 'Jarvis Network',
  token: '-',
  category: 'assets',
  start: 0, // WRONG!
  tvl
}