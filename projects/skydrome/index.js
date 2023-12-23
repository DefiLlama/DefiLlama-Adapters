const { getUniTVL } = require('../helper/unknownTokens')

const V1_FACTORY = '0x2516212168034b18a0155FfbE59f2f0063fFfBD9'
const V2_FACTORY = '0x74B8738862E4814C6E6D6e0202F8386685ca7B9D'

async function mergePromises(elements) {
  let results = await Promise.all(elements);
  return merge(results);
}

function merge(elements) {
  return elements.reduce((combined, current) => {
    for (const [id, amount] of Object.entries(current)) {
      if (!combined[id]) {
        combined[id] = 0;
      }
      combined[id] += amount;
    }

    return combined;
  }, {});
}

function getCombinedTVL() {
  return async (_, _b, cb, { api, chain } = {}) => {
    const tvlV1 = getUniTVL({
      factory: V1_FACTORY,
      useDefaultCoreAssets: true,
      hasStablePools: true,
    })(_, _b, cb, {api, chain})
    const tvlV2 = getUniTVL({
      factory: V2_FACTORY,
      useDefaultCoreAssets: true,
      hasStablePools: true,
    })(_, _b, cb, {api, chain})

    return await mergePromises([
      tvlV1,
      tvlV2
    ])
  }
}


module.exports = {
  misrepresentedTokens: true,
  scroll: {
    tvl: getCombinedTVL()
  },
}
