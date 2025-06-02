const { sumTokens2, getStorage, getBigMapById, } = require('../helper/chain/tezos')


const factory = 'KT1J8Hr3BP8bpbfmgGpRPoC9nAMSYtStZG43'
module.exports = {
  timetravel: false,
  tezos: {
    tvl: async () => {
      const data = await getStorage(factory)
      const pools = await getBigMapById(data.storage.pairs);
      const owners = Object.values(pools).map(i => i.bucket).filter(i => i)
      owners.push(factory)
      return sumTokens2({ owners, includeTezos: true, })
    },
  }
}
