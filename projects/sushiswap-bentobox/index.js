const { sumTokens2 } = require('../helper/unwrapLPs')

const bentobox_chains = [
  "ethereum",
  "polygon",
  // "fantom",
  //  "bsc",
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
    "0xE2d7F5dd869Fc7c126D21b13a9080e75a4bDb324"
  ],
}

const blacklistedTokens = {
  ethereum: ['0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3'], //MIM
  arbitrum: ['0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a'], //MIM
  avax: ['0x130966628846bfd36ff31a822705796e8cb8c18d'], //MIM
}

bentobox_chains.forEach((chain) => {
  module.exports[chain] = {
    tvl: (api) => sumTokens2({ api, owner: config[chain], fetchCoValentTokens: true, blacklistedTokens: blacklistedTokens[chain]  }),
  };
});
