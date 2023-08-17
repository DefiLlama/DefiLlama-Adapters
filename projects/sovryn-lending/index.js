const { get } = require('../helper/http')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  rsk: {
    tvl: async () => {
      return {
        'tether': (await get('https://backend.sovryn.app/tvl')).tvlLending.totalUsd
      }
    },
    borrowed: async (_, _1, _2, { api }) => {
      const data = Object.entries((await get('https://backend.sovryn.app/tvl')).tvlLending).filter(i => i[0].endsWith('_Lending')).map(i => i[1])
      const [ borrowed, decimals,] = await Promise.all([
        api.multiCall({ abi: 'uint256:totalAssetBorrow', calls: data.map(i => i.contract) }),
        api.multiCall({ abi: 'erc20:decimals', calls: data.map(i => i.asset) }),
      ])

      // data.forEach((v, i) => api.add(v.asset, borrowed[i]))
      // return;
      //https://github.com/DistributedCollective/Sovryn-frontend/blob/development/src/utils/blockchain/abi/LoanTokenLogicStandard.json#L1410
      return {
        'tether': data.reduce((acc, v, i) => acc + borrowed[i] * v.balanceUsd / (v.balance * (10 ** decimals[i])), 0)
      }
    }
  }
}