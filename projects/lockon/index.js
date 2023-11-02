const BigNumber = require('bignumber.js');

const SUPPLY_SCALE = BigNumber("10").pow(18)
const START_TIMESTAMP = 1690340140; // 2023-07-26T02:55:40Z
const CONTROLLER_ADDRESS = "0x153e739B8823B277844Ad885A30AC5bD9DfB6E83"

async function tvl(timestamp, _1, _2, { api, chain, block }) {

  const indexAddresses = (await api
    .call({
      abi: "address[]:getSets",
      target: CONTROLLER_ADDRESS,
    }));

  const supplies = (await api.multiCall({
    abi: "uint256:totalSupply",
    calls: indexAddresses.map((setAddress) => {
      return {
        target: setAddress,
      }
    }),
  }));

  const positionsForSets = (await api.multiCall({
    abi: "function getPositions() view returns (tuple(address component, address module, int256 unit, uint8 positionState, bytes data)[])",
    calls: indexAddresses.map((setAddress) => {
      return {
        target: setAddress,
      }
    }),
  }));

  positionsForSets.forEach(function(positionForSet, i) {
    const indexAddress = indexAddresses[i];
    const totalSupply = BigNumber(supplies[i]);
    if(positionForSet === null){
      throw new Error("positionForSet call failed")
    }
    positionForSet.forEach((position) => {
      const componentAddress = position[0];
      const positionUnits = BigNumber(position[2]);
      const balance= (positionUnits).times(totalSupply).div(SUPPLY_SCALE).toFixed(0)

      api.log("detail", JSON.stringify({chain, block, indexAddress, componentAddress, positionUnits: positionUnits.toString(), totalSupply: totalSupply.toString(), balance}))
      api.add(componentAddress, balance)
    });
  });
  api.log("summary", api.getBalances())
}

module.exports = {
  start: START_TIMESTAMP,
  polygon: { tvl }
}
