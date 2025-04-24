
const ADDRESSES = require('../helper/coreAssets.json')
const { call, sumTokens } = require("../helper/chain/ton");
const evaaPoolAssets = require("./evaaPoolAssets");

async function callWithRetry(callParams, maxRetries = 5, initialDelay = 1000, maxDelay = 5000) {
  let retries = 0;
  let delay = initialDelay;
  while (retries < maxRetries) {
    try {
      return await call(callParams);
    } catch (error) {
      retries++;
      if (retries >= maxRetries) {
        console.error(`Call failed after ${maxRetries} retries for target ${callParams.target} with abi ${callParams.abi}:`, error);
        throw error;
      }
      const waitTime = Math.min(delay, maxDelay);
      console.warn(`Call failed (attempt ${retries}/${maxRetries}), retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      delay *= 2;
    }
  }
}

async function borrowed(api) {
  for (const poolAssets of Object.values(evaaPoolAssets)) {
    for (const { assetId, address } of poolAssets.assets) {
      try {
        const [_totalSupply, totalBorrow] = await callWithRetry({ target: poolAssets.poolAddress, abi: 'getAssetTotals', params: [["int", assetId]] });
        api.add(address, totalBorrow);
      } catch (error) {
        console.error(`Failed to get totals for asset ${assetId} in pool ${poolAssets.poolAddress} after multiple retries.`);
        throw error;
      }
    }
  }
}

async function tvl(api) {
  const owners = Object.values(evaaPoolAssets).map(pool => pool.poolAddress);
  return sumTokens({ owners, api, tokens: [ADDRESSES.null], useTonApiForPrices: true })
}

module.exports = {
  methodology: 'Counts the supply of EVAA\'s asset pools as TVL.',
  ton: {
    tvl, borrowed,
  }
}
