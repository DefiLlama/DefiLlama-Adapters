const { get } = require('../helper/http')
const { RPC_ENDPOINT } = require('../helper/chain/tezos')
const { PromisePool } = require('@supercharge/promise-pool')

// crunchy farm address KT1KnuE87q1EKjPozJ5sRAjQA24FPsP57CE3
// TVL = sum(crunchFarm.poolBalance / quipuLP.total_supply * quipuLP.tez_pool * 2 * XTZUSD)
async function fetchFarmsTvl() {
    const farms = await get(RPC_ENDPOINT + '/v1/contracts/KT1KnuE87q1EKjPozJ5sRAjQA24FPsP57CE3/bigmaps/farms/keys?limit=1000')
    const items = farms.map(farm => [farm.value.poolToken.address, farm.value.poolBalance]).filter(item => item[1] !== "0")
    return getAllLPToTez(items);
}

// crunchy farm v2 address KT1L1WZgdsfjEyP5T4ZCYVvN5vgzrNbu18kX
// TVL = sum(crunchFarm.poolBalance / quipuLP.total_supply * quipuLP.tez_pool * 2 * XTZUSD)
async function fetchFarmsV2Tvl() {
    const farms = await get(RPC_ENDPOINT + '/v1/contracts/KT1L1WZgdsfjEyP5T4ZCYVvN5vgzrNbu18kX/bigmaps/farms/keys?limit=1000')
    const items = farms.map(farm => [farm.value.poolToken.address, farm.value.poolBalance]).filter(item => item[1] !== "0")
    return getAllLPToTez(items);
}

// crunchy freezer address KT1LjcQ4h5hCy9RcveFz9Pq8LtmF6oun7vNd
// TVL = sum(cruchFreezer.amountLocked / quipuLP.total_supply * quipuLP.tez_pool * 2 * XTZUSD)
async function fetchDeepFreezersTvl() {
    const freezers = await get(RPC_ENDPOINT + '/v1/contracts/KT1LjcQ4h5hCy9RcveFz9Pq8LtmF6oun7vNd/bigmaps/locks/keys?limit=1000')
    const items = freezers.map(freezer => [freezer.value.token.address, freezer.value.amountLocked]);
    return getAllLPToTez(items);
}

async function getAllLPToTez(items) {
    const { results, errors } = await PromisePool.withConcurrency(10)
        .for(items)
        .process(async ([lpTokenAddress, lpTokens]) => lpToTez(lpTokenAddress, lpTokens))

    if (errors && errors.length)
        throw errors[0]

    return results.reduce((previous, current) => previous +current, 0) * 2
}

async function lpToTez(lpTokenAddress, lpTokens) {
    if (lpTokens === "0") {
        return 0
    }

    const tokenStorage = await get(RPC_ENDPOINT + `/v1/contracts/${lpTokenAddress}/storage?limit=1000`);
    if (!tokenStorage.dex_lambdas)
        return 0
    

    const tokenBalance = lpTokens
    const tokenTotalSupply = tokenStorage.storage.total_supply
    const lpTezValue = tokenStorage.storage.tez_pool
    if (!lpTezValue || !tokenBalance || !tokenTotalSupply) return 0
    return lpTezValue * tokenBalance /tokenTotalSupply
}

async function tvl() {
    const farmsTvl = await fetchFarmsTvl();
    const farmsV2Tvl = await fetchFarmsV2Tvl();
    const deepFreezersTvl = await fetchDeepFreezersTvl();
    return {
        tezos: (farmsTvl + farmsV2Tvl + deepFreezersTvl ) / 1e6
    };
}

module.exports = {
    timetravel: false,
    tezos: {
        tvl
    }
};