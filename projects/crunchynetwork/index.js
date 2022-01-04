const rateLimit = require("axios-rate-limit");
const axios = rateLimit(require("axios").create(), {maxRPS: 10});
const BigNumber = require("bignumber.js");

// crunchy farm address KT1KnuE87q1EKjPozJ5sRAjQA24FPsP57CE3
// TVL = sum(crunchFarm.poolBalance / quipuLP.total_supply * quipuLP.tez_pool * 2 * XTZUSD)
async function fetchFarmsTvl() {
    const farms = (await axios.get('https://api.tzkt.io/v1/contracts/KT1KnuE87q1EKjPozJ5sRAjQA24FPsP57CE3/bigmaps/farms/keys?limit=1000')).data;
    const promises = [];
    for (let farm of farms) {
        promises.push(lpToTez(farm.value.poolToken.address, farm.value.poolBalance));
    }
    const values = await Promise.all(promises);
    const tvlInTez = values.reduce((previous, current) => previous.plus(current), new BigNumber(0));
    return tvlInTez.multipliedBy(2);
}

// crunchy freezer address KT1LjcQ4h5hCy9RcveFz9Pq8LtmF6oun7vNd
// TVL = sum(cruchFreezer.amountLocked / quipuLP.total_supply * quipuLP.tez_pool * 2 * XTZUSD)
async function fetchDeepFreezersTvl() {
    const freezers = (await axios.get('https://api.tzkt.io/v1/contracts/KT1LjcQ4h5hCy9RcveFz9Pq8LtmF6oun7vNd/bigmaps/locks/keys?limit=1000')).data;
    const promises = [];
    for (let freezer of freezers) {
        promises.push(lpToTez(freezer.value.token.address, freezer.value.amountLocked));
    }
    const values = await Promise.all(promises);
    const tvlInTez = values.reduce((previous, current) => previous.plus(current), new BigNumber(0));
    return tvlInTez.multipliedBy(2);
}

async function lpToTez(lpTokenAddress, lpTokens) {
    if (lpTokens === "0") {
        return new BigNumber(0);
    }

    const tokenStorage = (await axios.get(`https://api.tzkt.io/v1/contracts/${lpTokenAddress}/storage?limit=1000`)).data;
    if (!tokenStorage.dex_lambdas) {
        return new BigNumber(0);
    }

    const tokenBalance = new BigNumber(lpTokens);
    const tokenTotalSupply = new BigNumber(tokenStorage.storage.total_supply);
    const lpTezValue = new BigNumber(tokenStorage.storage.tez_pool);
    return tokenBalance.dividedBy(tokenTotalSupply).multipliedBy(lpTezValue);
}

async function fetch() {
    const tezPrice = (await axios.get('https://api.teztools.io/token/prices')).data;
    const farmsTvl = await fetchFarmsTvl();
    const deepFreezersTvl = await fetchDeepFreezersTvl();
    return farmsTvl.plus(deepFreezersTvl).multipliedBy(tezPrice.xtzusdValue).shiftedBy(-6).toFixed(0);
}

module.exports = {
    fetch
};