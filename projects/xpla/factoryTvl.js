const { queryContract } = require('../helper/chain/cosmos')
const { PromisePool } = require('@supercharge/promise-pool')
const { transformDexBalances } = require('../helper/portedTokens')

function getAssetInfo(asset) {
  return [asset.info.native_token?.denom ?? asset.info.token?.contract_addr, Number(asset.amount)]
}

async function getAllPairs(factory, chain) {
  let allPairs = []
  let currentPairs;
  do {
    const queryStr = `{"pairs": { "limit": 30 ${allPairs.length ? `,"start_after":${JSON.stringify(allPairs[allPairs.length - 1].asset_infos)}` : ""} }}`
    currentPairs = (await queryContract({ contract: factory, chain, data: queryStr })).pairs		
    allPairs.push(...currentPairs)
  } while (currentPairs.length > 0)
  const dtos = []
  const getPairPool = (async (pair) => {
    const pairRes = await queryContract({ contract: pair.contract_addr, chain, data: { pool: {} } })
		
    const pairDto = {}
    pairDto.assets = []
    pairDto.addr = pair.contract_addr
    pairRes.assets.forEach((asset, idx) => {
      const [addr, balance] = getAssetInfo(asset)
      pairDto.assets.push({ addr, balance })
    })
    dtos.push(pairDto)
  })
  await PromisePool
    .withConcurrency(31)
    .for(allPairs)
    .process(getPairPool)
  return dtos
}

function xpla(timestamp, ethBlock, chainBlocks) {
  const factory = "xpla1j33xdql0h4kpgj2mhggy4vutw655u90z7nyj4afhxgj4v5urtadq44e3vd"

    try{
    return async (_, _1, _2, { chain }) => {
      const pairs = (await getAllPairs(factory, chain)).filter(pair => (pair.assets[0].balance && pair.assets[1].balance))

      const data = pairs.map(({ assets }) => ({
        token0: assets[0].addr === 'axpla' ? 'xpla' : assets[0].addr,
        token0Bal: assets[0].addr === 'axpla' ? assets[0].balance/1000000000000000000 : assets[0].balance,
        token1: assets[1].addr === 'axpla' ? 'xpla' : assets[1].addr,
        token1Bal: assets[1].addr === 'axpla' ? assets[1].balance/1000000000000000000 : assets[1].balance,
      }))
      
      return await transformDexBalances({ chain, data })
    }
  } catch(err) {
    console.log("err:",err)
  }
}

module.exports = {
  xpla
}
