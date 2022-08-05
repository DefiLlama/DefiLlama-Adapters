const { getAPI } = require('../helper/acala/api')
// const { log } = require('../helper/utils')
// const { stringToU8a, u8aConcat, bnToU8a } = require('@polkadot/util')
// // const { blake2AsU8a } = require('@polkadot/util-crypto')
// const { encodeAddress, decodeAddress, } = require('@polkadot/keyring')
// const EMPTY_U8A_32 = new Uint8Array(32)
// const createAddress = id => encodeAddress(u8aConcat(stringToU8a(`modl${id}`), EMPTY_U8A_32).subarray(0, 32))

module.exports = {
  parallel: {
    tvl: async () => {
      const chain = 'parallel'
      const api = await getAPI(chain)
      return getAMMData(api)
    }
  },
  heiko: {
    tvl: async () => {
      const chain = 'heiko'
      const api = await getAPI(chain)
      return getAMMData(api)
    }
  },
};

// Taken from https://raw.githubusercontent.com/parallel-finance/amm-subql/883b278116a6252363387f1246a7f248b6cb1e7b/src/mappings/lpTokenPriceHandler.ts
async function getAMMData(api) {
  // const poolAccount = createAddress('par/ammp')
  const relayAssetId = (await api.consts.crowdloans.relayCurrency).toNumber();
  const nativeAssetId = (await api.consts.currencyAdapter.getNativeCurrencyId).toNumber();
  const metadatas = await api.query.assets.metadata.entries();
  const allAssets = metadatas.map(([{ args }, metadata]) => {
    const [assetId] = args;
    const { symbol, decimals } = metadata;
    return {
      assetId: assetId.toNumber(),
      symbol: symbol.toHuman().toString(),
      decimals: decimals.toNumber()
    };
  })

  allAssets.push({
    assetId: nativeAssetId,
    symbol: nativeAssetId === 0 ? 'HKO' : 'PARA', // hard code, cuz rpc is not available in subquery
    decimals: 12
  })

  const lpTokens = allAssets?.filter(asset => asset.symbol.startsWith('LP-')) || [];
  const lpTokenMappings = lpTokens
    .map(token => {
      const symbols = token.symbol.replace('LP-', '').split(/\/(.*)/s);
      const assets = symbols.map(symbol => allAssets.find(asset => asset.symbol === symbol));
      const relayAsset = assets.find(asset => asset?.assetId === relayAssetId);
      const otherAsset = assets.find(asset => asset?.assetId !== relayAssetId);
      return (
        relayAsset &&
        otherAsset && {
          token,
          relayAsset,
          otherAsset
        }
      );
    })
    .filter(i => i);


  const lpTokenPools = (await api.query.amm.pools.multi(
    lpTokenMappings.map(mapping => [mapping.relayAsset.assetId, mapping.otherAsset.assetId])
  )).map(i => i.toJSON())

  const lpTokenPoolsReverse = (await api.query.amm.pools.multi(
    lpTokenMappings.map(mapping => [mapping.otherAsset.assetId, mapping.relayAsset.assetId])
  )).map(i => i.toJSON())

  let total = 0
  lpTokenPools.forEach((data, i) => {
    if (data)
      total += +data.baseAmount * 2
    else
      total += +lpTokenPoolsReverse[i].quoteAmount * 2
  })

  if (nativeAssetId === 0) {
    return {
      kusama: total / 1e12
    }
  }

  return {
    polkadot: total / 1e10
  }
}
