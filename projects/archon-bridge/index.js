const { sumTokensExport } = require('../helper/unwrapLPs');

const tokens = {
  avax: {
    WAVAX: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
    USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    USDT: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
    DAI: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
    LINK: "0x5947bb275c521040051d82396192181b413227a3",
    WBTC: "0x50b7545627a5162F82A992c33b87aDc75187B218",
    WZEN: "0xAA1dA1591cBF7f2Df46884E7144297FF15Ea3a7f",
  },
  ethereum: {
    WETH: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    LINK: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    WBTC: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    WZEN: "0xd21475D90686c9A6FDBe0849cb6670fEc2aC9E21",
  },
  eon: {
    WAVAX: "0x6318374DFb468113E06d3463ec5Ed0B6Ae0F0982",
    WETH: "0x2c2E0B0c643aB9ad03adBe9140627A645E99E054",
    USDC: "0xCc44eB064CD32AAfEEb2ebb2a47bE0B882383b53",
    USDT: "0xA167bcAb6791304EDa9B636C8beEC75b3D2829E6",
    DAI: "0x38C2a6953F86a7453622B1E7103b738239728754",
    LINK: "0xDF8DBA35962Aa0fAD7ade0Df07501c54Ec7c4A89",
    WBTC: "0x1d7fb99AED3C365B4DEf061B7978CE5055Dfc1e7",
    WZEN: "0xF5cB8652a84329A2016A386206761f455bCEDab6",
  },
};

const archonBridge = {
  avax: {
    OriginalTokenBridgeToEon: '0x0c81b1905125ED89C42a0aDa098adfd461f8A9C5',
  },
  ethereum: {
    OriginalTokenBridgeToEon: '0x954367cb2028e704B62a4093f648BE453aCA3989',
  },
  eon: {
    OriginalTokenBridgeToAvalanche: '0x7A302432D99DE20bc622e9148b690f22ef21436e',
    OriginalTokenBridgeToEthereum: '0x4fd89120A6d34024Cb86a9a0d7819565Fe4eC351',
  },
};


module.exports = {
  hallmarks: [
    [1698796801, "Archon Bridge Launch"],
  ],
  avax: {
    tvl: sumTokensExport({
      owner: archonBridge.avax.OriginalTokenBridgeToEon,
      tokens: Object.values(tokens.avax),
    }),
  },
  ethereum: {
    tvl: sumTokensExport({
      owner: archonBridge.ethereum.OriginalTokenBridgeToEon,
      tokens: Object.values(tokens.ethereum),
    }),
  },
  eon: {
    tvl: sumTokensExport({
      owners: [
        archonBridge.eon.OriginalTokenBridgeToAvalanche,
        archonBridge.eon.OriginalTokenBridgeToEthereum,
      ],
      tokens: Object.values(tokens.eon),
    }),
  },
};
