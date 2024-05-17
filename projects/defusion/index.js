const { getConfig } = require('../helper/cache')

async function fetchData() {
  const { data } = await getConfig('viction/staking', 'https://server.defusion.xyz/api/v1/pool?page=1&size=100&sort=-apr')

  const totalStaked = data?.data?.map(item => ({amount: item.totalStaked})).reduce((total,stakeData) => total += stakeData.amount, 0)

  return {
    'tomochain:0xC054751BdBD24Ae713BA3Dc9Bd9434aBe2abc1ce': BigInt(totalStaked).toString(),
  }
}

module.exports.tomochain = {
  tvl:  () => ({}),
  staking: async () => {
    return await fetchData()
  }
} 

module.exports.misrepresentedTokens = true