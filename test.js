#!/usr/bin/env node
const path = require("path");
require('dotenv').config();
const { default: computeTVL } = require("@defillama/sdk/build/computeTVL");
const { chainsForBlocks } = require("@defillama/sdk/build/computeTVL/blocks");
const { getLatestBlock } = require("@defillama/sdk/build/util/index");
const { humanizeNumber } = require("@defillama/sdk/build/computeTVL/humanizeNumber");
const { util } = require("@defillama/sdk");

async function getLatestBlockRetry(chain) {
    for (let i = 0; i < 5; i++) {
        try {
            return await getLatestBlock(chain);
        } catch (e) {
            throw new Error(`Couln't get block heights for chain "${chain}"`, e)
        }
    }
}

const locks = [];
function getCoingeckoLock() {
    return new Promise((resolve) => {
        locks.push(resolve);
    });
}
function releaseCoingeckoLock() {
    const firstLock = locks.shift();
    if (firstLock !== undefined) {
        firstLock(null);
    }
}
// Rate limit is 50 calls/min for coingecko's API
// So we'll release one every 1.2 seconds to match it
setInterval(() => {
    releaseCoingeckoLock();
}, 2000);
const maxCoingeckoRetries = 5;


async function getTvl(unixTimestamp, ethBlock, chainBlocks,
    usdTvls,
    tokensBalances,
    usdTokenBalances,
    tvlFunction,
    isFetchFunction,
    storedKey,
    knownTokenPrices
) {
    if (!isFetchFunction) {
        const tvlBalances = await tvlFunction(
            unixTimestamp,
            ethBlock,
            chainBlocks
        );
        const tvlResults = await computeTVL(
            tvlBalances,
            "now",
            false,
            knownTokenPrices,
            getCoingeckoLock,
            maxCoingeckoRetries
        );
        usdTvls[storedKey] = tvlResults.usdTvl;
        tokensBalances[storedKey] = tvlResults.tokenBalances;
        usdTokenBalances[storedKey] = tvlResults.usdTokenBalances;
    } else {
        usdTvls[storedKey] = Number(await tvlFunction(
            unixTimestamp,
            ethBlock,
            chainBlocks
        ));
    }
    if (
        typeof usdTvls[storedKey] !== "number" ||
        Number.isNaN(usdTvls[storedKey])
    ) {
        throw new Error(
            `TVL for key ${storedKey} is not a number, instead it is ${usdTvls[storedKey]}`
        );
    }
}

function mergeBalances(key, storedKeys, balancesObject) {
    if (balancesObject[key] === undefined) {
        balancesObject[key] = {}
        storedKeys.map(keyToMerge => {
            Object.entries(balancesObject[keyToMerge]).forEach((balance) => {
                util.sumSingleBalance(balancesObject[key], balance[0], balance[1]);
            });
        })
    }
}

if (process.argv.length < 3) {
    console.error(`Missing argument, you need to provide the filename of the adapter to test.
    Eg: node test.js projects/myadapter.js`);
    process.exit(1);
}
const passedFile = path.resolve(process.cwd(), process.argv[2]);

(async () => {
    const module = require(passedFile);
    const unixTimestamp = Math.round(Date.now()/1000) - 60;
    const chainBlocks = {}
    const chains = Object.keys(module)
    if(!chains.includes("ethereum")){
        chains.push("ethereum")
    }
    await Promise.all(chains.map(async chain=>{
        if(chainsForBlocks.includes(chain) || chain === "ethereum"){
            chainBlocks[chain] = (await getLatestBlockRetry(chain)).number - 10
        }
    }))
    const ethBlock = chainBlocks.ethereum
    const usdTvls = {};
    const tokensBalances = {};
    const usdTokenBalances = {};
    const chainTvlsToAdd = {};
    const knownTokenPrices = {};

    let tvlPromises = Object.entries(module).map(async ([chain, value]) => {
        if (typeof value !== "object" || value === null) {
            return;
        }
        return Promise.all(Object.entries(value).map(async ([tvlType, tvlFunction]) => {
            if (typeof tvlFunction !== "function") {
                return
            }
            let storedKey = `${chain}-${tvlType}`
            let tvlFunctionIsFetch = false;
            if (tvlType === "tvl") {
                storedKey = chain
            } else if (tvlType === "fetch") {
                storedKey = chain
                tvlFunctionIsFetch = true
            }
            await getTvl(unixTimestamp, ethBlock, chainBlocks, usdTvls, tokensBalances,
                usdTokenBalances, tvlFunction, tvlFunctionIsFetch, storedKey, knownTokenPrices)
            let keyToAddChainBalances = tvlType;
            if (tvlType === "tvl" || tvlType === "fetch") {
                keyToAddChainBalances = "tvl"
            }
            if (chainTvlsToAdd[keyToAddChainBalances] === undefined) {
                chainTvlsToAdd[keyToAddChainBalances] = [storedKey]
            } else {
                chainTvlsToAdd[keyToAddChainBalances].push(storedKey)
            }
        }))
    })
    if (module.tvl || module.fetch) {
        let mainTvlIsFetch;
        if (module.tvl) {
            mainTvlIsFetch = false
        } else {
            mainTvlIsFetch = true
        }
        const mainTvlPromise = getTvl(unixTimestamp, ethBlock, chainBlocks, usdTvls, tokensBalances,
            usdTokenBalances, mainTvlIsFetch ? module.fetch : module.tvl, mainTvlIsFetch, 'tvl', knownTokenPrices)
        tvlPromises.push(mainTvlPromise)
    }
    await Promise.all(tvlPromises)
    Object.entries(chainTvlsToAdd).map(([tvlType, storedKeys]) => {
        if (usdTvls[tvlType] === undefined) {
            usdTvls[tvlType] = storedKeys.reduce((total, key) => total + usdTvls[key], 0)
            mergeBalances(tvlType, storedKeys, tokensBalances)
            mergeBalances(tvlType, storedKeys, usdTokenBalances)
        }
    })
    if(usdTvls.tvl === undefined){
        throw new Error("Protocol doesn't have total tvl, make sure to export a tvl key either on the main object or in one of the chains")
    }

    Object.entries(usdTokenBalances).forEach(([chain, balances]) => {
        console.log(`--- ${chain} ---`)
        Object.entries(balances).sort((a, b)=>b[1]-a[1]).forEach(([symbol, balance]) => {
            console.log(symbol.padEnd(25, " "), humanizeNumber(balance))
        })
        console.log("Total:", humanizeNumber(usdTvls[chain]), "\n");
    })
    console.log(`------ TVL ------`)
    Object.entries(usdTvls).forEach(([chain, usdTvl]) => {
        if(chain !== "tvl"){
            console.log(chain.padEnd(25, " "), humanizeNumber(usdTvl))
        }
    })
    console.log("\ntotal".padEnd(25, " "), humanizeNumber(usdTvls.tvl), "\n")

    process.exit(0);
})();
