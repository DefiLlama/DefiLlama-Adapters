const sdk = require('@defillama/sdk')
const abi = require("./abi.json");
const { getParamCalls, getUniqueAddresses } = require('../helper/utils')

const APERTURE_MANAGER_ADDRESS = "0xeD380115259FcC9088c187Be1279678e23a6E565";

const abis = {
  strategyIdToMetadata: "function strategyIdToMetadata(uint64 arg0) view returns (string, string, address)",
}

async function getVaults(chain, block) {
  const { output: nextStrategyId } = await sdk.api.abi.call({
    target: APERTURE_MANAGER_ADDRESS,
    abi: abi.getStrategyId,
    chain, block,
  })
  const { output: vaults } = await sdk.api.abi.multiCall({
    target: APERTURE_MANAGER_ADDRESS,
    abi: abis.strategyIdToMetadata,
    calls: getParamCalls(nextStrategyId),
    chain, block,
  })
  return getUniqueAddresses(vaults.map(i => i.output[2]));
}

module.exports = {
  getVaults,
};
