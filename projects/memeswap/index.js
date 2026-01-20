const ADDRESSES = require('../helper/coreAssets.json')

const factory = '0x80DA434B49b4d3481aF81D58Eaa3817c888377d4'
const vault = '0x21F18c02B2487024018Ef3a4D95f9D436867743d'

async function tvl(api) {
  const pairs = await api.fetchList({ lengthAbi: 'allPairsLength', itemAbi: 'allPairs', target: factory })
  pairs.push(vault)
  return api.sumTokens({ owners: pairs, token: ADDRESSES.berachain.WBERA })
}

module.exports = {
  berachain: {
    tvl
  },
}