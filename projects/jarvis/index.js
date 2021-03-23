const sdk = require("@defillama/sdk");

const usdcToken = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const synthCollateralContracts = ['0x48546bdd57d34cb110f011cdd1ccaae75ee17a70','0x182d5993106573a95a182ab3a77c892713ffda56','0x496b179d5821d1a8b6c875677e3b89a9229aab77']

async function tvl(timestamp, block) {
  let balances = {};

  const collateralTokens = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: synthCollateralContracts.map(contract=>({
      target: usdcToken,
      params: [contract]
    })),
    block
  })
  sdk.util.sumMultiBalanceOf(balances, collateralTokens)
  return balances
}
  

module.exports = {
  name: 'Jarvis',
  token: '-',
  category: 'assets',
  start: 0, // WRONG!
  tvl
}