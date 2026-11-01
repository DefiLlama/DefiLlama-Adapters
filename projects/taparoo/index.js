const { queryCanister, decodeCandid } = require('../helper/chain/icp')

module.exports = {
  misrepresentedTokens: true,
  icp: { tvl },
}

async function tvl(api) {
  const [response] = decodeCandid(await queryCanister({
    canisterId: '5ez4n-ayaaa-aaaah-qdqua-cai',
    methodName: 'getTvl',
  }))
  const satoshiAmount = parseInt(response.replace(/"/g, ''))
  const btcAmount = satoshiAmount / 100000000
  api.add('bitcoin', btcAmount)
}
