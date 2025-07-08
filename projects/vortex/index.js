const { sumTokens2, getStorage, getBigMapById, } = require('../helper/chain/tezos')

async function staking() {
  return sumTokens2({ owners: ['KT1Cp18EbxDk2WcbC1YVUyGuwuvtzyujwu4U']})
}

module.exports = {
  tezos: {
    tvl: async () => {
      const data = await getStorage('KT1UnRsTyHVGADQWDgvENL3e9i6RMnTVfmia')
      const swaps = await getBigMapById(data.swaps);
      return sumTokens2({ owners: Object.values(swaps), includeTezos: true, })
    },
    staking,
  }
}
