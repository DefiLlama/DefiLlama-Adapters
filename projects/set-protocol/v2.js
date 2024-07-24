const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');


const SUPPLY_SCALE = BigNumber("10").pow(18)
const START_BLOCK = 10830496;

const getSets = "address[]:getSets"
const getPositions = 'function getPositions() view returns (tuple(address component, address module, int256 unit, uint8 positionState, bytes data)[])';
const totalSupply = "uint256:totalSupply";

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
    calls: setAddresses.map((setAddress) => {
      return {
        target: setAddress,
      }
    }),
  })).output;

  let positionsForSets = (await sdk.api.abi.multiCall({
    abi: getPositions,
    block,
    calls: setAddresses.map((setAddress) => {
      return {
        target: setAddress,
      }
    }),
  })).output;

  positionsForSets.forEach(function(positionForSet, i) {
    const setSupply = BigNumber(supplies[i].output);
    if(positionForSet.output === null){
      throw new Error("positionForSet call failed")
    }
    positionForSet.output.forEach((position) => {
      const componentAddress = position[0];
      const positionUnits = BigNumber(position[2]);
      
      balances[componentAddress] = BigNumber(balances[componentAddress] || 0).plus((positionUnits).times(setSupply).div(SUPPLY_SCALE)).toFixed(0);
    });    
  });

  return balances;
};
