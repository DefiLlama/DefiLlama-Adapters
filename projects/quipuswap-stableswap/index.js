const { sumTokens2, getStorage, getBigMapById, } = require('../helper/chain/tezos')
const { PromisePool } = require('@supercharge/promise-pool')
const sdk = require('@defillama/sdk')

const stableSwap = async (api) => {
  const data = await getStorage('KT1UPiYB4HrLFcHQ5tkjahGnDM55E8iEbNAx')
  const pools = await getBigMapById(data.storage.pool_id_to_address);
  return sumTokens2({ owners: Object.values(pools), includeTezos: false, })
}

const sswapAndYupuna = async (api) => {
  const data = await getStorage('KT1Q9gw5mZSLPGkoCaWc5a8FKLGDiTiULc6R')
  const pools = await getBigMapById(data.storage.pool_id_to_address);
  const { errors } = await PromisePool.withConcurrency(10)
    .for(Object.values(pools).slice(0, 2))
    .process(async pool => {
      const { storage: data } = await getStorage(pool)
      const tokenInfos = await getBigMapById(data.pools);
      const tokenDatas = await getBigMapById(data.tokens);
      Object.keys(tokenInfos).forEach(key => {
        const { tokens_info } = tokenInfos[key]
        const tokenData = tokenDatas[key]
        Object.keys(tokens_info).forEach(key => {
          const token = getToken(tokenData[key])
          const { reserves } = tokens_info[key]
          api.add(token, reserves)
        })
      })
    })

  if (errors && errors.length)
    throw errors[0]
  return api.getBalances()
}

function getToken(object) {
  if (object.fa12) return object.fa12
  if (object.fa2) {
    const { token_id, token_address } = object.fa2
    if (token_id && token_id !== '0') return `${token_address}-${token_id}`
    return token_address
  }
  throw new Error("Unknown token type" + JSON.stringify(object, null, 2))
}

module.exports = {
  timetravel: false,
  tezos: {
    tvl: sdk.util.sumChainTvls([stableSwap, sswapAndYupuna]),
  }
}

