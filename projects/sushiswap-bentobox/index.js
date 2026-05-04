const { sumTokens2 } = require('../helper/unwrapLPs')
const { covalentGetTokens } = require('../helper/token')

const bentobox_chains = [
  "ethereum",
  "polygon",
  // "fantom",
  // "bsc",
  "avax",
  "arbitrum",
  "optimism",
  "xdai",
  // "harmony",
  "moonbeam",
  "moonriver",
  //"kava",
  //"metis",
  "celo",
];

const config = {
  "ethereum": [
    "0xf5bce5077908a1b7370b9ae04adc565ebd643966",
  ],
  "arbitrum": [
    "0x74c764d41b77dbbb4fe771dab1939b00b146894a",
  ],
  "optimism": [
    "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
  ],
  "polygon": [
    "0x0319000133d3AdA02600f0875d2cf03D442C3367",
  ],
  "avax": [
    "0x0711B6026068f736bae6B213031fCE978D48E026",
  ],
  "bsc": [
    "0xF5BCE5077908a1b7370B9ae04AdC565EBd643966",
  ],
  "fantom": [],
  "xdai": [
    "0xE2d7F5dd869Fc7c126D21b13a9080e75a4bDb324",
  ],
  "moonbeam": [
    "0x80C7DD17B01855a6D2347444a0FCC36136a314de",
  ],
  "moonriver": [
    "0x145d82bCa93cCa2AE057D1c6f26245d1b9522E6F",
  ],
  "celo": [
    "0x0711B6026068f736bae6B213031fCE978D48E026",
  ],
}

const blacklistedTokens = {
  ethereum: ['0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3'], //MIM
  arbitrum: ['0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a'], //MIM
}

// totals(token) returns Rebase { base, elastic } where elastic = actual token amount tracked by BentoBox
const totalsAbi = 'function totals(address) view returns (uint128 elastic, uint128 base)'

bentobox_chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: async (api) => {
      const blacklisted = blacklistedTokens[chain] || []
      const owners = config[chain]

      if (!owners || owners.length === 0) return {}

      // Try to discover tokens via Covalent/Ankr
      let tokens = []
      try {
        tokens = await covalentGetTokens(owners[0], api, { onlyWhitelisted: true, ignoreMissingChain: true })
      } catch (e) {
        // Token discovery failed, fall back to sumTokens2
      }

      const filteredTokens = tokens.filter(t => !blacklisted.includes(t.toLowerCase()))

      if (filteredTokens.length > 0) {
        // Use totals(token).elastic to get accurate token amounts
        // This correctly accounts for tokens deposited into BentoBox strategies
        // (not just the raw balance sitting in the contract)
        const totals = await api.multiCall({
          target: owners[0],
          abi: totalsAbi,
          calls: filteredTokens.map(t => ({ params: [t] })),
          permitFailure: true,
        })

        totals.forEach((t, i) => {
          if (t && t.elastic && t.elastic !== '0') {
            api.add(filteredTokens[i], t.elastic)
          }
        })

        return api.getBalances()
      }

      // Fallback to raw balanceOf approach
      return sumTokens2({ api, owners, fetchCoValentTokens: true, blacklistedTokens: blacklisted })
    },
  };
});
