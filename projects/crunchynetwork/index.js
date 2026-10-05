const sdk = require('@defillama/sdk')
const { getStorage } = require('../helper/chain/tezos')

const tezos = sdk.chains.tezos

const getBigMapValues = (contract, path) => tezos.tzktAll({ path: `/v1/contracts/${contract}/bigmaps/${path}/keys`, params: { active: true, select: 'value' } })

// crunchy farm address KT1KnuE87q1EKjPozJ5sRAjQA24FPsP57CE3
// TVL = sum(crunchFarm.poolBalance / quipuLP.total_supply * quipuLP.tez_pool * 2 * XTZUSD)
async function fetchFarmsTvl(farmContract) {
  const farms = await getBigMapValues(farmContract, 'farms')
  const items = farms.map(farm => [farm.poolToken.address, farm.poolBalance]).filter(item => item[1] !== "0")
  return getAllLPToTez(items)
}

// crunchy freezer address KT1LjcQ4h5hCy9RcveFz9Pq8LtmF6oun7vNd
// TVL = sum(cruchFreezer.amountLocked / quipuLP.total_supply * quipuLP.tez_pool * 2 * XTZUSD)
async function fetchDeepFreezersTvl() {
  const freezers = await getBigMapValues('KT1LjcQ4h5hCy9RcveFz9Pq8LtmF6oun7vNd', 'locks')
  const items = freezers.map(freezer => [freezer.token.address, freezer.amountLocked])
  return getAllLPToTez(items)
}

async function getAllLPToTez(items) {
  // the same LP shows up in many farms / locks, so read each pool storage once
  const storages = {}
  let sum = 0
  for (const [lpTokenAddress, lpTokens] of items) {
    if (lpTokens === "0") continue
    if (!storages[lpTokenAddress]) storages[lpTokenAddress] = await getStorage(lpTokenAddress)
    sum += lpToTez(storages[lpTokenAddress], lpTokens)
  }
  return sum * 2
}

function lpToTez(tokenStorage, lpTokens) {
  if (!tokenStorage.dex_lambdas) return 0 // not a quipuswap v1 pool
  const tokenTotalSupply = tokenStorage.storage.total_supply
  const lpTezValue = tokenStorage.storage.tez_pool
  if (!lpTezValue || !lpTokens || !tokenTotalSupply) return 0
  return lpTezValue * lpTokens / tokenTotalSupply
}

async function tvl() {
  const farmsTvl = await fetchFarmsTvl('KT1KnuE87q1EKjPozJ5sRAjQA24FPsP57CE3')
  const farmsV2Tvl = await fetchFarmsTvl('KT1L1WZgdsfjEyP5T4ZCYVvN5vgzrNbu18kX')
  const deepFreezersTvl = await fetchDeepFreezersTvl()
  return {
    tezos: (farmsTvl + farmsV2Tvl + deepFreezersTvl) / 1e6
  }
}

module.exports = {
  timetravel: false,
  tezos: {
    tvl
  }
}
