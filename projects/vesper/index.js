/*==================================================
  Modules
  ==================================================*/

const sdk = require("@defillama/sdk");
const abi = require('./abi.json')
const BigNumber = require("bignumber.js");
const _ = require("underscore");

async function tvl(timestamp, block) {
  const vesperPoolAddresses = []
  const balances = {};
  const collateralToken = {};
  const controller = '0xa4F1671d3Aee73C05b552d57f2d16d3cfcBd0217'

  // Get pool list
  let poolAddressListResponse = await sdk.api.abi.call({
    target: controller,
    abi: abi["pools"]
  });

  let poolsCountResponse = await sdk.api.abi.call({
    target: poolAddressListResponse.output,
    abi: abi["length"]
  });

  const calls = []
  let i = 0
  while(i < parseInt(poolsCountResponse.output)) {
    calls.push({
      target: poolAddressListResponse.output,
      params: i
    })
    i++
  }
  const poolListResponse = await sdk.api.abi.multiCall({
    calls,
    abi: abi["at"],
  });

  _.each(poolListResponse.output, (response) => {
    if (response.success) {
      vesperPoolAddresses.push(response.output)
    }
  });

  // Get collateral token
  const collateralTokenResponse = await sdk.api.abi.multiCall({
    calls: _.map(vesperPoolAddresses, (poolAddress) => ({
      target: poolAddress
    })),
    abi: abi["token"],
  });

  _.each(collateralTokenResponse.output, (response) => {
    if (response.success) {
      const collateralTokenAddress = response.output;
      const poolAddress = response.input.target;
      collateralToken[poolAddress] = collateralTokenAddress;
      if (!balances.hasOwnProperty(collateralTokenAddress)) {
        balances[collateralTokenAddress] = 0;
      }
    }
  });

  //Get TVL
  const totalValueResponse = await sdk.api.abi.multiCall({
    block,
    calls: _.map(vesperPoolAddresses, (poolAddress) => ({
      target: poolAddress,
    })),
    abi: abi["totalValue"],
  });

  _.each(totalValueResponse.output, (response) => {
    if (response.success) {
      const totalValue = response.output;
      const poolAddress = response.input.target;
      const existingBalance = new BigNumber(balances[collateralToken[poolAddress]] || "0");
      balances[collateralToken[poolAddress]] = existingBalance.plus(new BigNumber(totalValue)).toFixed();
    }
  });
  return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  name: "Vesper",
  website: "https://vesper.finance",
  token: "VSP",
  category: "assets",
  start: 1608667205, // December 22 2020 at 8:00 PM UTC
  tvl,
  contributesTo: ["Aave", "Maker", "Compound"],
};
