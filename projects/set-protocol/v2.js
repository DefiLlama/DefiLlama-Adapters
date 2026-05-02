const BigNumber = require('bignumber.js');


const SUPPLY_SCALE = BigNumber("10").pow(18)

const getSets = "address[]:getSets"
const getPositions = 'function getPositions() view returns (tuple(address component, address module, int256 unit, uint8 positionState, bytes data)[])';
const totalSupply = "uint256:totalSupply";

module.exports = async function tvl(api) {

  const setAddresses = await api.call({ abi: getSets, target: '0xa4c8d221d8BB851f83aadd0223a8900A6921A349', })

  let supplies = await api.multiCall({ abi: totalSupply, calls: setAddresses, })

  let positionsForSets = await api.multiCall({ abi: getPositions, calls: setAddresses, })

  positionsForSets.forEach(function (positionForSet, i) {
    const setSupply = BigNumber(supplies[i]);
    positionForSet.forEach((position) => {
      const componentAddress = position[0];
      const positionUnits = BigNumber(position[2]);
      const bal = positionUnits.times(setSupply).div(SUPPLY_SCALE)
      api.add(componentAddress, bal.toNumber())
    });
  });
};
