const { unwrapNFTs } = require('./utils')
const { getConfig: getConfigCache } = require('../helper/cache')
const { get } = require('../helper/http')

// the api answers failures with HTTP 200 + { is_success: false, data: {} }; throwing on those keeps getConfig
// from caching the error over the last good farm list (it fell back to the cache instead)
async function getConfig(chainId) {
  const data = await getConfigCache('izumi-liquidbox/' + chainId, undefined, {
    fetcher: async () => {
      const res = await get(`https://api.izumi.finance/api/v1/farm/compute?chainId=${chainId}`)
      if (!res?.is_success || !res.data?.contracts) throw new Error(`izumi farm api error for ${chainId}: ${res?.error_code}`)
      return res
    }
  });
  if (!data?.data?.contracts) throw new Error(`izumi farm config unavailable for chain ${chainId} (api failing, no good cached copy)`)
  return data.data;
}

const chains =  {
  'ethereum': 1,
  'bsc': 56,
  'polygon': 137,
  'arbitrum': 42161,
  'aurora': 1313161554,
  'cronos': 25,
};

module.exports = {
  deadFrom: "2026-09-30", // farms sunset?
  // ownTokens: ['IZI', 'IUSD'],
}

Object.keys(chains).forEach(chain => {
    module.exports[chain] = {
      tvl: getTvl(chain, false),
      pool2: getTvl(chain, true),
    }
})

function getTvl(chain, isPool2) {
  return async (_, _b, { [chain]: block }) => {
    const config = await getConfig(chains[chain]);
    var contracts
    if (isPool2){contracts = config.contracts[chain].pool2}
    else {contracts = config.contracts[chain].pools}
    return unwrapNFTs({ chain, block, nftAddress: config.liquidityManagers[chain], config: contracts, fixTokens: config.fixTokens[chain] })
  }
}