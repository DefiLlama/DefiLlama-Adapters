const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(_, _b, _cb, { api, }) {
  const vaults = ['0x829363736a5A9080e05549Db6d1271f070a7e224']
  const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
  const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults })
  api.addTokens(tokens, bals)
  const ownerTokens = [
    [[ADDRESSES.polygon.WETH_1, ADDRESSES.polygon.WBTC], '0x1F9b1057cd93fb2d07d18810903B791b56acc2E1']
  ]
  return sumTokens2({ api, ownerTokens })
}

async function ethTvl(_, _b, _cb, { api, }) {
  const ethBaskets = [
    '0x61A18EE9d6d51F838c7e50dFD750629Fd141E944', '0x78Bb94Feab383ccEd39766a7d6CF31dED177Ad0c', '0x72D51B2233c5feA8a702FDd0E51B0adE95638f2c'
  ]
  const tokens = await api.multiCall({ abi: 'address:asset', calls: ethBaskets })
  const bals = await api.multiCall({ abi: 'uint256:totalAssets', calls: ethBaskets })
  api.addTokens(tokens, bals)
}

module.exports = {
  doublecounted: true,
  methodology: 'Counts the tokens in the Affine baskets',
  polygon: { tvl },
  ethereum: { tvl: ethTvl }
}
