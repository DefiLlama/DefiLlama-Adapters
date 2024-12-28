const { createIncrementArray } = require("../helper/utils");
const { getLogs } = require('../helper/cache/getLogs')

const V1_CHAINS = ["ethereum", "manta", "avax"]
const V2_CHAINS = ["manta", "avax"]
const CHAINS = [...new Set([...V2_CHAINS,...V1_CHAINS])]

// Where possible contracts are deployed using deterministic addresses
const V1_ADDRESSES = {
  controller: "0xb2E609ef662889a32452598F0131863035974878",
  monusd: "0xDf3d57c3480951958Cef19905E4cf7FC1bA9ad42"
}
const V1_SPECIAL_ADDRESSES = {
  zklink: {
    controller: "0xD620b0613568406F427a6f5d4ecA301870a1A3d5",
    monusd: "0x051baaA86328Fc7F522431932B8010F66f260A6a"
  }
}
const DETERMINISTIC_roeUSD = "0x87196DB491ee1C77B91853CB79C118A322d6A9c0"
// V2 addresses
const V2_ADDRESSES = {
  manta: "0xF88DF111343BffE7a2d89FB770d77A264d53f043",
  avax: "0xF88DF111343BffE7a2d89FB770d77A264d53f043",
  arbitrum: DETERMINISTIC_roeUSD,
  ethereum: DETERMINISTIC_roeUSD
}

async function tvl(api) {
  const owners = []
  const tokens = []
  
  // V1
  if (V1_CHAINS.indexOf(api.chain) > -1){
    const addresses = V1_SPECIAL_ADDRESSES.hasOwnProperty(api.chain) ? V1_SPECIAL_ADDRESSES[api.chain] : V1_ADDRESSES
    const vaultLength = await api.call({ abi: "uint:getVaultsLength", target: addresses.controller })
    const vaultCalls = createIncrementArray(vaultLength)

    const vaults = await api.multiCall({  abi: "function mintVaults(uint vaultId) view returns (address)", calls: vaultCalls, target: addresses.monusd})
    const _tokens = await api.multiCall({  abi: 'address:collateralAsset', calls: vaults})
    tokens.push(..._tokens)
    owners.push(...vaults)
  }
  
  // V2
  if (V2_CHAINS.indexOf(api.chain) > -1) {
    const vaultLengthV2 = await api.call({ abi: "uint:getVaultsLength", target: V2_ADDRESSES[api.chain] })
    const vaultCallsV2 = createIncrementArray(vaultLengthV2)
    const vaultsV2 = await api.multiCall({  abi: "function vaults(uint vaultId) view returns (address)", calls: vaultCallsV2, target: V2_ADDRESSES[api.chain]})

    const _tokensV2 = await api.multiCall({  abi: 'address:collateralAsset', calls: vaultsV2})
    tokens.push(..._tokensV2)
    owners.push(...vaultsV2)
  }

  return api.sumTokens({ tokensAndOwners2: [tokens, owners]})
}


module.exports = {
  methodology:
    "Adds up the total value locked as collateral in Monroe vaults",
  start: '2024-03-13', // March 13, 2024 00:00 GMT
  hallmarks: [
    [1722000000, "V2 Launch"]
  ],
};

CHAINS.forEach((chain) => {
  module.exports[chain] = { tvl };
});