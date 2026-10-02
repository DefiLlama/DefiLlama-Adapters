const { getLogs2 } = require('../helper/cache/getLogs')

// ADEXTO (https://adexto.xyz) opens every market as one AdextoCurve: a bonding curve that trades the token
// against the chain's native coin and never graduates or migrates. Contracts:
// https://github.com/0xcuy/adexto/tree/main/contracts

// ADEXTO factories of generations 0.11.0, 0.12.0 and 1.0.0, which share the TrinityProjectDeployed event
// (contracts/AdextoFactory.sol, "COMPATIBILITY"). Each address was checked on chain with VERSION(). Sources:
// "Mainnet deployments" in https://github.com/0xcuy/adexto/blob/main/README.md (1.0.0 and 0.11.0),
// https://github.com/0xcuy/adexto/blob/main/src/config/contracts.ts (0.12.0) and, per launch,
// https://github.com/0xcuy/adexto/blob/main/src/config/onchain-launches.json.
// The 0.10.0 factories are not listed: their markets on 0G were superseded or test launches.
// fromBlock is the block of the chain's first market, so no factory log can predate it.
const config = {
  '0g': {
    fromBlock: 43706550, // ADEXTO, tx 0xce701d9d33daa3cf1918b2f428166d9da690110a7144e13b125e788008bdc182
    factories: [
      '0x51c4168226463F7e5A141e1c6D30520734BC840a', // 0.11.0
      '0x06C80fD2d5d9365C20aC468c15874DBE748877e2', // 0.12.0
      '0xEBbE0fB112859b57A0ad1afbeD4978e43dC96c5D', // 1.0.0
    ],
  },
  monad: {
    fromBlock: 103845897, // CURB, tx 0x743152ee89066a98e1b5cad500fe8d65f55255585d908f132a90b101985aadca
    factories: [
      '0x5800e9715a47a598fce9bc3B65a95FD6BeBf76A3', // 0.11.0
      '0xcA9c77f050CD1e0685b03D0236579966DA9B39B9', // 0.12.0
      '0x3dFcBEd7dd889F465cC9f75c430B43Ef873b6056', // 1.0.0
    ],
  },
  base: {
    fromBlock: 51372549, // BLOOP, tx 0x06299c0c23f3c3fb0c74e9c5fbcbf1611fd3a4980d9a1ebb64d1c3378b173b55
    factories: [
      '0x216E7880D64D94335B583c539802d3e61958d4A2', // 0.11.0
      '0xe5B9555fbbcE72A5739dD29c3939A23fd230136F', // 0.12.0
      '0xF5f904ca7763Fc6755bbCe5466a9DBd4C15c2708', // 1.0.0
    ],
  },
  arbitrum: {
    fromBlock: 505650908, // WOMBO, tx 0x868aee2e6632a437b0b58a3ed1556091a0e658de0071420644726fe60479f362
    factories: [
      '0xE17f1027FC5f294327D701829baeD9d6519e922C', // 0.11.0
      '0x75EeDEd196D2BE283d815D52F617eB70bCe865bC', // 0.12.0
      '0x79DF3671e7e7456832C84a34c2bC0DB7871C0E0E', // 1.0.0
    ],
  },
  robinhood: {
    fromBlock: 77064241, // SAI, tx 0xe05bc1fb93ba902ff6a15b36e80aa804609ab4e6c1780a0a6bcec8723286f38e
    factories: [
      '0x8e63e117E71A80Cfc10fDF375F079e2e29cd7D7D', // 1.0.0, the only generation on Robinhood Chain
    ],
  },
}

const DEPLOYED_EVENT = 'event TrinityProjectDeployed(address indexed token, address indexed curve, address indexed creator, string name, string symbol, uint256 initialSupply, uint256 curveTokens, uint256 virtualNative, uint256 depthFeeBps, uint256 creatorFeeBps, uint256 treasuryBuybackBps, bytes32 metadataRoot)'

module.exports = {
  methodology: 'Native coin (ETH, MON or 0G) that ADEXTO bonding curves hold as real reserve, read from each curve with realNative(). The virtual reserve, which only sets the opening price and is never deposited, is excluded, as are accrued fees not yet claimed and the unsold market tokens the curves hold.',
}

Object.keys(config).forEach((chain) => {
  const { fromBlock, factories } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const curves = []
      for (const factory of factories) {
        const launches = await getLogs2({ api, factory, eventAbi: DEPLOYED_EVENT, fromBlock })
        curves.push(...launches.map((launch) => launch.curve))
      }
      if (!curves.length) return
      const reserves = await api.multiCall({ abi: 'uint256:realNative', calls: curves })
      reserves.forEach((reserve) => api.addGasToken(reserve))
    },
  }
})
