const { multicall } = require("./multicall.js");
const { ethers } = require("ethers");

const APERTURE_MANAGER_ADDRESS = "0xeD380115259FcC9088c187Be1279678e23a6E565";
const APERTURE_MANAGER_ABI = [
  "function nextStrategyId() external view returns (uint128)",
  "function strategyIdToMetadata(uint64) external view returns (string, string, address)",
];

const provider = new ethers.providers.JsonRpcProvider(
  "https://api.avax.network/ext/bc/C/rpc"
);

const apertureManager = new ethers.Contract(
  APERTURE_MANAGER_ADDRESS,
  APERTURE_MANAGER_ABI,
  provider
);

async function getVaults() {
  const setOfVaults = new Set();
  const nextStrategyId = await apertureManager.nextStrategyId();

  let calldata = [];
  let strategyAddr;

  for (var i = 0; i < nextStrategyId; i++) {
    calldata.push({
      contract: apertureManager,
      method: "strategyIdToMetadata",
      args: i,
    });
  }

  const result = await multicall(calldata);
  for (let i = 0; i < nextStrategyId; i++) {
    strategyAddr = result[i][2];
    if (strategyAddr !== undefined) {
      setOfVaults.add(strategyAddr);
    } else {
      console.log(i);
    }
  }

  return Array.from(setOfVaults);
}

module.exports = {
  getVaults,
};
