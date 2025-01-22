const { call, getTokenRates } = require("../helper/chain/ton");
const evaaPoolAssets = require("./evaaPoolAssets");

async function processTVL(api) {
  const assetPricesMap = new Map();

  for (const [poolName, poolAssets] of Object.entries(evaaPoolAssets)) {
    for (const { assetId, decimals, cgId, cgListed, address } of poolAssets.assets) {
      let success = false;
      let retries = 3;
      let delay = 1000; // milliseconds

      while (!success && retries > 0) {
        try {
          const [totalSupply, totalBorrow] = await call({ target: poolAssets.poolAddress, abi: 'getAssetTotals', params: [["int", assetId]] });
          const assetTvl = totalSupply / 10 ** decimals;
          if(cgListed) {
            api.addCGToken(cgId, assetTvl);
          } else {
            if(assetPricesMap.has(address)) {
              const assetPrice = assetPricesMap.get(address);
              api.add('tether', assetPrice * assetTvl, { skipChain: true })
            } else {
              const tokenRates = await getTokenRates({ tokens: [address] })
              const tokenPrice = tokenRates[address];
              assetPricesMap.set(address, tokenPrice);
              api.add('tether', tokenPrice * assetTvl, { skipChain: true })
            }
          }
          success = true;
        } catch (error) {
          if (error) {
            retries -= 1;
            if (retries > 0) {
              await new Promise(resolve => setTimeout(resolve, delay));
              delay *= 2; // Exponential backoff
            }
          } else {
            throw error; // Rethrow other errors
          }
        }
      }

      if (!success) {
        throw new Error(`Failed to fetch data after multiple retries for assetId: ${assetId}`);
      }
    }
  }
}

module.exports = {
  methodology: 'Counts the supply of EVAA\'s asset pools as TVL.',
  ton: {
    tvl: (api) => processTVL(api),
  }
}
