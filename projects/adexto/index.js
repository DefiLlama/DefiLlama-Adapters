const ADDRESSES = require('../helper/coreAssets.json')

// ADEXTO (https://adexto.xyz) opens every market as one bonding curve that trades the token against the
// chain's native coin and never graduates or migrates. Contracts: https://github.com/0xcuy/adexto/tree/main/contracts

// Every ADEXTO factory generation, mapped to its deploy block. Each factory lists its launches on chain in
// allProjects / totalProjectsCount, and is skipped at blocks before it existed.
const config = {
  '0g': {
    '0xaA85bc0cceB35B524b6BB730612540Fb88df0f8e': 43173642, // 0.10.0
    '0x51c4168226463F7e5A141e1c6D30520734BC840a': 43704079, // 0.11.0
    '0x06C80fD2d5d9365C20aC468c15874DBE748877e2': 45602744, // 0.12.0
    '0xEBbE0fB112859b57A0ad1afbeD4978e43dC96c5D': 45793987, // 1.0.0
  },
  monad: {
    '0x5800e9715a47a598fce9bc3B65a95FD6BeBf76A3': 102583076, // 0.11.0
    '0xcA9c77f050CD1e0685b03D0236579966DA9B39B9': 108871845, // 0.12.0
    '0x3dFcBEd7dd889F465cC9f75c430B43Ef873b6056': 109440540, // 1.0.0
  },
  base: {
    '0x216E7880D64D94335B583c539802d3e61958d4A2': 50971523, // 0.11.0
    '0xe5B9555fbbcE72A5739dD29c3939A23fd230136F': 51922828, // 0.12.0
    '0xF5f904ca7763Fc6755bbCe5466a9DBd4C15c2708': 52008858, // 1.0.0
  },
  arbitrum: {
    '0xE17f1027FC5f294327D701829baeD9d6519e922C': 502476317, // 0.11.0
    '0x75EeDEd196D2BE283d815D52F617eB70bCe865bC': 509845969, // 0.12.0
    '0x79DF3671e7e7456832C84a34c2bC0DB7871C0E0E': 510474755, // 1.0.0
  },
  robinhood: {
    '0x8e63e117E71A80Cfc10fDF375F079e2e29cd7D7D': 76864198, // 1.0.0, the only generation on Robinhood Chain
  },
}

const ALL_PROJECTS = 'function allProjects(uint256) view returns (address token, address curve)'

module.exports = {
  methodology: 'Native coin (ETH, MON or 0G) held by ADEXTO bonding curves, which are listed by each factory generation. This includes creator and protocol fees not yet claimed. The unsold market tokens the curves hold are not counted.',
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const block = await api.getBlock()
      const factories = Object.entries(config[chain]).filter(([, deployBlock]) => block >= deployBlock).map(([factory]) => factory)
      const curves = []
      for (const factory of factories) {
        const projects = await api.fetchList({ target: factory, lengthAbi: 'totalProjectsCount', itemAbi: ALL_PROJECTS })
        curves.push(...projects.map((project) => project.curve))
      }
      return api.sumTokens({ owners: curves, tokens: [ADDRESSES.null] })
    },
  }
})
