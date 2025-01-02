const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')
const BTC_ETH_VAULT = '0x1F9b1057cd93fb2d07d18810903B791b56acc2E1'.toLowerCase()

async function tvl(api) {
  await getBasketTvl(api)
  const ownerTokens = [
    [[ADDRESSES.polygon.WETH_1, ADDRESSES.polygon.WBTC], BTC_ETH_VAULT]
  ]
  return sumTokens2({ api, ownerTokens })
}

async function ethTvl(api) {
  return getBasketTvl(api)
}

async function getBasketTvl(api) {
  const data = await getConfig('affine-defi', 'https://api.affinedefi.com/v2/getBasketMetadata')
  const baskets = Object.values(data).filter(i => i.chainId === api.chainId && i.basketAddress.toLowerCase() !== BTC_ETH_VAULT).map(i => i.basketAddress)
  const tokens = await api.multiCall({ abi: 'address:asset', calls: baskets })
  const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: baskets })
  api.addTokens(tokens, bals)
}

module.exports = {
  doublecounted: true,
  methodology: 'Counts the tokens in the Affine baskets',
  polygon: { tvl },
  ethereum: { tvl: ethTvl }
}
