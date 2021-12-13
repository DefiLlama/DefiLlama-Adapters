const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const _ = require('underscore');

const SUPPLY_SCALE = BigNumber("10").pow(18)
const START_BLOCK = 10830496;
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
      target: '0xa4c8d221d8BB851f83aadd0223a8900A6921A349',
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
    if(positionForSet.output === null){
      throw new Error("positionForSet call failed")
    }
    _.each(positionForSet.output, (position) => {
      const componentAddress = position[0];
      const positionUnits = BigNumber(position[2]);
      
      const isExternalPosition = position[3] == EXTERNAL_POSITION;
      balances[componentAddress] = BigNumber(balances[componentAddress] || 0).plus((positionUnits).times(setSupply).div(SUPPLY_SCALE)).toFixed(0);
    });    
  });

  return balances;
};
