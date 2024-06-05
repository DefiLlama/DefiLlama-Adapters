const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

async function tvl(api) {
  const balances = {}
  const reactorTvl = await api.multiCall({
    abi: 'uint256:getPoolDenominatedValue', calls: [
      '0x933589C46233Efa8cCDe8287E077cA6CC51Bec17', // uniswapV3HedgingReactor alpha
      '0xDd418b4Ec8396191D08957bD42F549e215B8e89a', // perpHedgingReactor
      '0x0053849115783b9678DBB173BB852f06e950Fe05', // uniswapV3HedgingReactor beyond
      '0x5250F9ab6a6a7CB447dc96cb218cE9E796905852', // uniswapV3RangeOrderReactor
      '0xf013767D55954EcCCacb4914d52D2ef8f95d82C5', // perpHedgingReactor
      '0x575e7766F22DBE82b6DD31B915B7D429B9409F16' // gmxHedgingReactor
    ]
  })
  reactorTvl.forEach(i => sdk.util.sumSingleBalance(balances, 'tether', i / 1e18))

  return sumTokens2({
    api, balances, tokensAndOwners: [
      [ADDRESSES.arbitrum.USDC, '0xc10b976c671ce9bff0723611f01422acbae100a5'], // LP alpha
      [ADDRESSES.arbitrum.USDC_CIRCLE, '0x217749d9017cB87712654422a1F5856AAA147b80'], // LP beyond USDC native
      [ADDRESSES.arbitrum.USDC, '0xb9F33349db1d0711d95c1198AcbA9511B8269626'],  // marginPool
      [ADDRESSES.arbitrum.USDC_CIRCLE, '0xb9F33349db1d0711d95c1198AcbA9511B8269626'],  // marginPool USDC native
      [ADDRESSES.arbitrum.WETH, '0xb9F33349db1d0711d95c1198AcbA9511B8269626'],  // marginPool
    ]
  })
}

module.exports = {
  misrepresentedTokens: true,
  arbitrum: { tvl }
}