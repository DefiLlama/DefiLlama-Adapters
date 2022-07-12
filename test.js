#!/usr/bin/env node
const path = require("path");
require("dotenv").config();
const { default: computeTVL } = require("@defillama/sdk/build/computeTVL");
const { chainsForBlocks } = require("@defillama/sdk/build/computeTVL/blocks");
const { getLatestBlock } = require("@defillama/sdk/build/util/index");
const {
  humanizeNumber,
} = require("@defillama/sdk/build/computeTVL/humanizeNumber");
const { util } = require("@defillama/sdk");
const sdk = require("@defillama/sdk");
const whitelistedExportKeys = require('./projects/helper/whitelistedExportKeys.json')
const chainList = require('./projects/helper/chains.json')
const handleError = require('./utils/handleError')
const { diplayUnknownTable } = require('./projects/helper/utils')

async function getLatestBlockRetry(chain) {
  for (let i = 0; i < 5; i++) {
    try {
      return await getLatestBlock(chain);
    } catch (e) {
      throw new Error(`Couln't get block heights for chain "${chain}"`, e);
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

async function getTvl(
  unixTimestamp,
  ethBlock,
  chainBlocks,
  usdTvls,
  tokensBalances,
  usdTokenBalances,
  tvlFunction,
  isFetchFunction,
  storedKey,
  knownTokenPrices
) {
  if (!isFetchFunction) {
    const tvlBalances = await tvlFunction(unixTimestamp, ethBlock, chainBlocks);
    const tvlResults = await computeTVL(
      tvlBalances,
      "now",
      false,
      knownTokenPrices,
      getCoingeckoLock,
      maxCoingeckoRetries
    );
    await diplayUnknownTable({ tvlResults, storedKey, tvlBalances, })
    usdTvls[storedKey] = tvlResults.usdTvl;
    tokensBalances[storedKey] = tvlResults.tokenBalances;
    usdTokenBalances[storedKey] = tvlResults.usdTokenBalances;
  } else {
    usdTvls[storedKey] = Number(
      await tvlFunction(unixTimestamp, ethBlock, chainBlocks)
    );
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
    balancesObject[key] = {};
    storedKeys.map((keyToMerge) => {
      Object.entries(balancesObject[keyToMerge]).forEach((balance) => {
        util.sumSingleBalance(balancesObject[key], balance[0], balance[1]);
      });
    });
  }
}

if (process.argv.length < 3) {
  console.error(`Missing argument, you need to provide the filename of the adapter to test.
    Eg: node test.js projects/myadapter.js`);
  process.exit(1);
}
const passedFile = path.resolve(process.cwd(), process.argv[2]);

const originalCall = sdk.api.abi.call
sdk.api.abi.call = async (...args)=>{
  try{
    return await originalCall(...args)
  } catch(e){
    console.log("sdk.api.abi.call errored with params:", args)
    throw e
  }
}

(async () => {
  let module = {};
  try {
    module = require(passedFile)
  } catch(e) {
    console.log(e)
  }
  const chains = Object.keys(module).filter(item => typeof module[item] === 'object' && !Array.isArray(module[item]));
  checkExportKeys(module, passedFile, chains)
  const unixTimestamp = Math.round(Date.now() / 1000) - 60;
  const chainBlocks = {};

  if (!chains.includes("ethereum")) {
    chains.push("ethereum");
  }
  await Promise.all(
    chains.map(async (chainRaw) => {
      const chain = chainRaw === "avalanche"?"avax":chainRaw
      if (chainsForBlocks.includes(chain) || chain === "ethereum") {
        chainBlocks[chain] = (await getLatestBlockRetry(chain)).number - 10;
      }
    })
  );
  const ethBlock = chainBlocks.ethereum;
  const usdTvls = {};
  const tokensBalances = {};
  const usdTokenBalances = {};
  const chainTvlsToAdd = {};
  const knownTokenPrices = {};

  let tvlPromises = Object.entries(module).map(async ([chain, value]) => {
    if (typeof value !== "object" || value === null) {
      return;
    }
    return Promise.all(
      Object.entries(value).map(async ([tvlType, tvlFunction]) => {
        if (typeof tvlFunction !== "function") {
          return;
        }
        let storedKey = `${chain}-${tvlType}`;
        let tvlFunctionIsFetch = false;
        if (tvlType === "tvl") {
          storedKey = chain;
        } else if (tvlType === "fetch") {
          storedKey = chain;
          tvlFunctionIsFetch = true;
        }
        await getTvl(
          unixTimestamp,
          ethBlock,
          chainBlocks,
          usdTvls,
          tokensBalances,
          usdTokenBalances,
          tvlFunction,
          tvlFunctionIsFetch,
          storedKey,
          knownTokenPrices
        );
        let keyToAddChainBalances = tvlType;
        if (tvlType === "tvl" || tvlType === "fetch") {
          keyToAddChainBalances = "tvl";
        }
        if (chainTvlsToAdd[keyToAddChainBalances] === undefined) {
          chainTvlsToAdd[keyToAddChainBalances] = [storedKey];
        } else {
          chainTvlsToAdd[keyToAddChainBalances].push(storedKey);
        }
      })
    );
  });
  if (module.tvl || module.fetch) {
    let mainTvlIsFetch;
    if (module.tvl) {
      mainTvlIsFetch = false;
    } else {
      mainTvlIsFetch = true;
    }
    const mainTvlPromise = getTvl(
      unixTimestamp,
      ethBlock,
      chainBlocks,
      usdTvls,
      tokensBalances,
      usdTokenBalances,
      mainTvlIsFetch ? module.fetch : module.tvl,
      mainTvlIsFetch,
      "tvl",
      knownTokenPrices
    );
    tvlPromises.push(mainTvlPromise);
  }
  await Promise.all(tvlPromises);
  Object.entries(chainTvlsToAdd).map(([tvlType, storedKeys]) => {
    if (usdTvls[tvlType] === undefined) {
      usdTvls[tvlType] = storedKeys.reduce(
        (total, key) => total + usdTvls[key],
        0
      );
      mergeBalances(tvlType, storedKeys, tokensBalances);
      mergeBalances(tvlType, storedKeys, usdTokenBalances);
    }
  });
  if (usdTvls.tvl === undefined) {
    throw new Error(
      "Protocol doesn't have total tvl, make sure to export a tvl key either on the main object or in one of the chains"
    );
  }

  Object.entries(usdTokenBalances).forEach(([chain, balances]) => {
    console.log(`--- ${chain} ---`);
    Object.entries(balances)
      .sort((a, b) => b[1] - a[1])
      .forEach(([symbol, balance]) => {
        console.log(symbol.padEnd(25, " "), humanizeNumber(balance));
      });
    console.log("Total:", humanizeNumber(usdTvls[chain]), "\n");
  });
  console.log(`------ TVL ------`);
  Object.entries(usdTvls).forEach(([chain, usdTvl]) => {
    if (chain !== "tvl") {
      console.log(chain.padEnd(25, " "), humanizeNumber(usdTvl));
    }
  });
  console.log("\ntotal".padEnd(25, " "), humanizeNumber(usdTvls.tvl), "\n");

  process.exit(0);
})();


function checkExportKeys(module, filePath, chains) {
  filePath = filePath.split(path.sep)
  filePath = filePath.slice(filePath.lastIndexOf('projects') + 1)

  if (filePath.length > 2  
    || (filePath.length === 1 && !['.js', ''].includes(path.extname(filePath[0]))) // matches .../projects/projectXYZ.js or .../projects/projectXYZ
    || (filePath.length === 2 && !['api.js', 'index.js'].includes(filePath[1])))  // matches .../projects/projectXYZ/index.js
    process.exit(0)

  const blacklistedRootExportKeys = ['tvl', 'staking', 'pool2', 'borrowed', 'treasury'];
  const rootexportKeys = Object.keys(module).filter(item => typeof module[item] !== 'object');
  const unknownChains = chains.filter(chain => !chainList.includes(chain));
  const blacklistedKeysFound = rootexportKeys.filter(key => blacklistedRootExportKeys.includes(key));
  let exportKeys = chains.map(chain => Object.keys(module[chain])).flat()
  exportKeys.push(...rootexportKeys)
  exportKeys = Object.keys(exportKeys.reduce((agg, key) => ({...agg, [key]: 1}), {})) // get unique keys
  const unknownKeys = exportKeys.filter(key => !whitelistedExportKeys.includes(key))


  if (unknownChains.length) {
    throw new Error(`
    Unknown chain(s): ${unknownChains.join(', ')}
    Note: if you think that the chain is correct but missing from our list, please add it to 'projects/helper/chains.json' file
    `)
  }

  if (blacklistedKeysFound.length) {
    throw new Error(`
    Please move the following keys into the chain: ${blacklistedKeysFound.join(', ')}

    We have a new adapter export specification now where tvl and other chain specific information are moved inside chain export.
    For example if your protocol is on ethereum and has tvl and pool2, the export file would look like:
    
        module.exports = {
          methodlogy: '...',
          ethereum: {
            tvl: 
            pool2:
          }
        }

    `)
  }

  if (unknownKeys.length) {
    throw new Error(`
    Found export keys that were not part of specification: ${unknownKeys.join(', ')}

    List of valid keys: ${['', '', ...whitelistedExportKeys].join('\n\t\t\t\t')}
    `)
  }
}


process.on('unhandledRejection', handleError)
process.on('uncaughtException', handleError)