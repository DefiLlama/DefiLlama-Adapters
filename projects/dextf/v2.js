const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const _ = require('underscore');

const SUPPLY_SCALE = BigNumber("10").pow(18)
const START_BLOCK = 12783638;
const EXTERNAL_POSITION = '1';

const getSets = require('./abis/getSets.json');
const getPositions = require('./abis/getPositions.json');
const totalSupply = require('./abis/totalSupply.json');
const getReserves = require('./abis/getReserves.json');

const pairAddresses = {
  '0xBb2b8038a1640196FbE3e38816F3e67Cba72D940': [
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  ],
  '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11': [
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  ],
};

/*==================================================
  TVL
  ==================================================*/

module.exports = async function tvl(timestamp, block) {
  let balances = {};

  if (block <= START_BLOCK) {
    return balances;
  }

  const setAddresses = (await sdk.api.abi
    .call({
      abi: getSets,
      target: '0xE0CF093Ce6649Ef94fe46726745346AFc25214D8',
      block,
    })).output;

  let supplies = (await sdk.api.abi.multiCall({
    abi: totalSupply,
    block,
    calls: _.map(setAddresses, (setAddress) => {
      return {
        target: setAddress,
      }
    }),
  })).output;

  let positionsForSets = (await sdk.api.abi.multiCall({
    abi: getPositions,
    block,
    calls: _.map(setAddresses, (setAddress) => {
      return {
        target: setAddress,
      }
    }),
  })).output;

  let uniswapPositions = {};
  _.each(positionsForSets, function(positionForSet, i) {
    const setSupply = BigNumber(supplies[i].output);
    _.each(positionForSet.output, (position) => {
      const componentAddress = position[0];
      const positionUnits = BigNumber(position[2]);

      const isExternalPosition = position[3] == EXTERNAL_POSITION;
      if (isExternalPosition) {
        uniswapPositions[componentAddress] = BigNumber(uniswapPositions[componentAddress] || 0).plus((positionUnits).times(setSupply)).toFixed();
      } else {
        balances[componentAddress] = BigNumber(balances[componentAddress] || 0).plus((positionUnits).times(setSupply).div(SUPPLY_SCALE)).toFixed();
      }
    });
  });

  const reserves = (await sdk.api.abi
    .multiCall({
      abi: getReserves,
      calls: Object.keys(uniswapPositions).map((pairAddress) => ({
        target: pairAddress,
      })),
      block,
    })).output;

  let reserveSupplies = (await sdk.api.abi.multiCall({
    abi: totalSupply,
    block,
    calls: _.map(Object.keys(uniswapPositions), (pairAddress) => {
      return {
        target: pairAddress,
      }
    }),
  })).output;

  _.each(reserves, function(reserve, i) {
    const pairAddress = reserve.input.target;
    const tokenPair = pairAddresses[pairAddress];
    const setSupplyRatio = new BigNumber(uniswapPositions[pairAddress]).div(new BigNumber(reserveSupplies[i].output)).div(SUPPLY_SCALE);

    // handle reserve0
    if (tokenPair[0]) {
      const reserve0 = new BigNumber(reserve.output['0']);
      if (!reserve0.isZero()) {
        const existingBalance = new BigNumber(
          balances[tokenPair[0]] || '0'
        );

        balances[tokenPair[0]] = existingBalance
          .plus(reserve0.times(setSupplyRatio))
          .toFixed()
      }
    }

    // handle reserve1
    if (tokenPair[1]) {
      const reserve1 = new BigNumber(reserve.output['1']);

      if (!reserve1.isZero()) {
        const existingBalance = new BigNumber(
          balances[tokenPair[1]] || '0'
        );

        balances[tokenPair[1]] = existingBalance
          .plus(reserve1.times(setSupplyRatio))
          .toFixed()
      }
    }
  });

  return balances;
};
