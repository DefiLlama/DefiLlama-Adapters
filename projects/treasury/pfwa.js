const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require('../helper/treasury')

// PFWA treasury on Robinhood Chain: the platformAddress of both PFWAMarketFactory contracts, so it receives PFWA Markets'
// protocol fees (trading fees, early-sell penalties, market creation fees). It holds ETH and the ecosystem token $PFWA.
const PFWA_TREASURY = '0xa0a6e5C0F17DA5e5337C9CD5bf353C61BA375c0D'
const PFWA = '0xa934bA4F59070149d37A93F8A002Af79BAe35563'

module.exports = treasuryExports({
  robinhood: {
    owners: [PFWA_TREASURY],
    tokens: [nullAddress, ADDRESSES.robinhood.WETH, ADDRESSES.robinhood.USDG],
    ownTokens: [PFWA],
  },
})

// $PFWA has a CoinGecko listing (predict-fwa) but no Robinhood Chain price in DefiLlama's price feed yet, so its
// balance is added by the CoinGecko id (the helper's own ownTokens bucket would value it at 0)
module.exports.robinhood.ownTokens = async (api) => {
  const balance = await api.call({ abi: 'erc20:balanceOf', target: PFWA, params: PFWA_TREASURY })
  api.addCGToken('predict-fwa', balance / 1e18)
  return api.getBalances()
}
