const BigNumber = require("bignumber.js");
const { get } = require('../helper/http')
const { RPC_ENDPOINT } = require('../helper/chain/tezos')
const { PromisePool } = require('@supercharge/promise-pool')

// crunchy farm address KT1KnuE87q1EKjPozJ5sRAjQA24FPsP57CE3
// TVL = sum(crunchFarm.poolBalance / quipuLP.total_supply * quipuLP.tez_pool * 2 * XTZUSD)
async function fetchFarmsTvl() {
    const farms = await get(RPC_ENDPOINT + '/v1/contracts/KT1KnuE87q1EKjPozJ5sRAjQA24FPsP57CE3/bigmaps/farms/keys?limit=1000')
    const items = farms.map(farm => [farm.value.poolToken.address, farm.value.poolBalance]);
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

    return results.reduce((previous, current) => previous.plus(current), new BigNumber(0)).multipliedBy(2)
}

async function lpToTez(lpTokenAddress, lpTokens) {
    if (lpTokens === "0") {
        return new BigNumber(0);
    }

    const tokenStorage = await get(RPC_ENDPOINT + `/v1/contracts/${lpTokenAddress}/storage?limit=1000`);
    if (!tokenStorage.dex_lambdas) {
        return new BigNumber(0);
    }

    const tokenBalance = new BigNumber(lpTokens);
    const tokenTotalSupply = new BigNumber(tokenStorage.storage.total_supply);
    const lpTezValue = new BigNumber(tokenStorage.storage.tez_pool);
    return tokenBalance.dividedBy(tokenTotalSupply).multipliedBy(lpTezValue);
}

async function tvl() {
    const farmsTvl = await fetchFarmsTvl();
    const deepFreezersTvl = await fetchDeepFreezersTvl();
    return {
        tezos: farmsTvl.plus(deepFreezersTvl).shiftedBy(-6).toFixed(0)
    };
}

module.exports = {
    timetravel: false,
    tezos: {
        tvl
    }
};