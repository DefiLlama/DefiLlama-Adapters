const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2, } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

async function tvl(_, _b, _cb, { api, }) {
  const balances = {}
  const reactorTvl = await api.multiCall({
    abi: 'uint256:getPoolDenominatedValue', calls: [
      '0x933589C46233Efa8cCDe8287E077cA6CC51Bec17',
      '0xDd418b4Ec8396191D08957bD42F549e215B8e89a',
    ]
  })
  reactorTvl.forEach(i => sdk.util.sumSingleBalance(balances, 'tether', i/1e18))

  return sumTokens2({
    api, balances, tokensAndOwners: [
      [ADDRESSES.arbitrum.USDC, '0xc10b976c671ce9bff0723611f01422acbae100a5'], // LP alpha
      ["0xaf88d065e77c8cC2239327C5EDb3A432268e5831", '0x217749d9017cB87712654422a1F5856AAA147b80'], // LP beyond USDC native
      [ADDRESSES.arbitrum.USDC, '0xb9F33349db1d0711d95c1198AcbA9511B8269626'],  // marginPool
      ["0xaf88d065e77c8cC2239327C5EDb3A432268e5831", '0xb9F33349db1d0711d95c1198AcbA9511B8269626'],  // marginPool USDC native
      [ADDRESSES.arbitrum.WETH, '0xb9F33349db1d0711d95c1198AcbA9511B8269626'],  // marginPool
    ]
  })
}

module.exports = {
  misrepresentedTokens: true,
  arbitrum: { tvl }
}