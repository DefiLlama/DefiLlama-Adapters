const { getUniTVL } = require('../helper/unknownTokens')

const baseTvl = getUniTVL({
  useDefaultCoreAssets: true,
  factory: '0x5669a449D892f03B4c541A321926f18e272c64A2',
})

const tvl = async (api) => {
  const newRpcUrl = 'https://darwinia.rpc.subquery.network/public';
  api.provider.rpcs = [{ url: newRpcUrl }];
  return baseTvl(api)
}

module.exports = {
  misrepresentedTokens: true,
  crab: { tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0x36ABF1A7851fBF9ae9D79dc3E39C1227068158B3' }), },
  darwinia: { tvl },
}