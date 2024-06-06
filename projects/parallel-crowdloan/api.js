const { getAPI } = require('../helper/acala/api')

module.exports = {
  misrepresentedTokens: true,
  parallel: {
    tvl: async () => {
      const chain = 'parallel'
      const api = await getAPI(chain)
      return getCrowdloan(api)
    }
  },
  heiko: {
    tvl: async () => {
      const chain = 'heiko'
      const api = await getAPI(chain)
      return getCrowdloan(api)
    }
  },
};

// Taken from https://github.com/parallel-finance/dump-script/blob/523b9ae42606562a51681fc47244355d2bb2e647/src/service.ts
async function getCrowdloan(api) {
  const nativeAssetId = (await api.consts.currencyAdapter.getNativeCurrencyId).toNumber();
  const vaults = (await api.query.crowdloans.vaults.entries()).map(i => i[1].toJSON())

  let total = 0
  vaults.forEach(data => {
    if (['Succeeded', 'Contributing', 'Closed'].includes(data.phase))
    total += +data.contributed
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
