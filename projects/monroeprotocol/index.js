const { createIncrementArray } = require("../helper/utils");
const { getLogs } = require('../helper/cache/getLogs')

// Controllers[chain]
const CONTROLLERS = {
  manta: "0xb2E609ef662889a32452598F0131863035974878",
}


async function tvl(api) {
  const logs = await getLogs({
    api,
    target: CONTROLLERS[api.chain],
    eventAbi: "event CreatedSynth(address newSynth, string name, address oracle)",
    onlyArgs: true,
    fromBlock: 1548740
  });
  const synthAddresses = logs.map(log => log.newSynth);

  const vaultLength = await api.call({ abi: "uint:getVaultsLength", target: CONTROLLERS[api.chain] })
  const vaultCalls = createIncrementArray(vaultLength)

  const owners = []
  const tokens = []
  await Promise.all(synthAddresses.map(async (synth) => {
    const vaults = await api.multiCall({  abi: "function mintVaults(uint vaultId) view returns (address)", calls: vaultCalls, target: synth})
    const _tokens = await api.multiCall({  abi: 'address:collateralAsset', calls: vaults})
    tokens.push(..._tokens)
    owners.push(...vaults)
  }))

  return api.sumTokens({ tokensAndOwners2: [tokens, owners]})
}


module.exports = {
  methodology:
    "Adds up the total value locked as collateral in Monroe vaults",
  start: 1710288000, // March 13, 2024 00:00 GMT
};

Object.keys(CONTROLLERS).forEach((chain) => {
  module.exports[chain] = { tvl };
});