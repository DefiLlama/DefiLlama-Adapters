const { createIncrementArray } = require("../helper/utils");
const { getLogs } = require('../helper/cache/getLogs')

const CHAINS = ["ethereum", "manta", "avax", "iotex"]

// Where possible contracts are deployed using deterministic addresses
const DEFAULT_ADDRESSES = {
  controller: "0xb2E609ef662889a32452598F0131863035974878",
  monusd: "0xDf3d57c3480951958Cef19905E4cf7FC1bA9ad42"
}
const SPECIAL_ADDRESSES = {
  zklink: {
    controller: "0xD620b0613568406F427a6f5d4ecA301870a1A3d5",
    monusd: "0x051baaA86328Fc7F522431932B8010F66f260A6a"
  }
}

async function tvl(api) {
  const addresses = SPECIAL_ADDRESSES.hasOwnProperty(api.chain) ? SPECIAL_ADDRESSES[api.chain] : DEFAULT_ADDRESSES
  const vaultLength = await api.call({ abi: "uint:getVaultsLength", target: addresses.controller })
  const vaultCalls = createIncrementArray(vaultLength)

  const owners = []
  const tokens = []

  const vaults = await api.multiCall({  abi: "function mintVaults(uint vaultId) view returns (address)", calls: vaultCalls, target: addresses.monusd})
  const _tokens = await api.multiCall({  abi: 'address:collateralAsset', calls: vaults})
  tokens.push(..._tokens)
  owners.push(...vaults)


  return api.sumTokens({ tokensAndOwners2: [tokens, owners]})
}


module.exports = {
  methodology:
    "Adds up the total value locked as collateral in Monroe vaults",
  start: 1710288000, // March 13, 2024 00:00 GMT
};

CHAINS.forEach((chain) => {
  module.exports[chain] = { tvl };
});