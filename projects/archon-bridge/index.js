const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const tokens = {
  avax: {
    WAVAX: ADDRESSES.avax.WAVAX,
    USDC: ADDRESSES.avax.USDC,
    USDT: ADDRESSES.avax.USDt,
    DAI: ADDRESSES.avax.DAI,
    LINK: "0x5947bb275c521040051d82396192181b413227a3",
    WBTC: ADDRESSES.avax.WBTC_e,
    WZEN: "0xAA1dA1591cBF7f2Df46884E7144297FF15Ea3a7f",
  },
  ethereum: {
    WETH: ADDRESSES.ethereum.WETH,
    USDC: ADDRESSES.ethereum.USDC,
    USDT: ADDRESSES.ethereum.USDT,
    DAI: ADDRESSES.ethereum.DAI,
    LINK: ADDRESSES.ethereum.LINK,
    WBTC: ADDRESSES.ethereum.WBTC,
    WZEN: "0xd21475D90686c9A6FDBe0849cb6670fEc2aC9E21",
  },
  eon: {
    WAVAX: "0x6318374DFb468113E06d3463ec5Ed0B6Ae0F0982",
    WETH: "0x2c2E0B0c643aB9ad03adBe9140627A645E99E054",
    USDC: "0xCc44eB064CD32AAfEEb2ebb2a47bE0B882383b53",
    USDT: "0xA167bcAb6791304EDa9B636C8beEC75b3D2829E6",
    DAI: "0x38C2a6953F86a7453622B1E7103b738239728754",
    LINK: "0xDF8DBA35962Aa0fAD7ade0Df07501c54Ec7c4A89",
    WBTC: ADDRESSES.eon.WBTC,
    WZEN: ADDRESSES.eon.ZEN,
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
