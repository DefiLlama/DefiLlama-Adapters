const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

const ethereumContracts = ["0x1390f521A79BaBE99b69B37154D63D431da27A07", "0xe17F8e501bF5e968e39D8702B30c3A8b955d8f52"];
const polygonContracts = ["0x2714C5958e2b1417B3f2b7609202FFAD359a5965"];
const optimismContracts = ["0xBdd40916bBC43bE14dd7183C30a64EE4A893D97f"];
const arbitrumContracts = ["0x149e2C169f10914830EF39B9d184AE62BbCdF526"];
const lineaContracts = ["0x508f001baa00976fc1d679af880267555900ab09"];
const modeContracts = ["0xB884389d818046F48Ca63d4cCAF303ba65f6DbC1"];
const scrollContracts = ["0x1e4a1a0d31cFDDC722965a0c2d3bBecF748252d6"];

const ethereumTokens = [
  ADDRESSES.null,
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.USDT,
  ADDRESSES.ethereum.WBTC,
  ADDRESSES.ethereum.MATIC,
  '0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1', // arb
  ADDRESSES.ethereum.LINK,
  ADDRESSES.ethereum.AAVE,
  ADDRESSES.ethereum.MKR,
  ADDRESSES.ethereum.LIDO,
  "0xD33526068D116cE69F19A9ee46F0bd304F21A51f", // rpl
  "0xCa14007Eff0dB1f8135f4C25B34De49AB0d42766", // strk
  "0xc00e94cb662c3520282e6f5717214004a7f26888" // comp
];
const polygonTokens = [
  ADDRESSES.null,
  ADDRESSES.polygon.USDC,
  ADDRESSES.polygon.USDT,
]

const optimismTokens = [
  ADDRESSES.null,
  ADDRESSES.optimism.USDC,
  ADDRESSES.optimism.USDC_CIRCLE,
  ADDRESSES.optimism.USDT,
]

const arbitrumTokens = [
  ADDRESSES.null,
  ADDRESSES.arbitrum.USDC,
  ADDRESSES.arbitrum.USDC_CIRCLE,
  ADDRESSES.arbitrum.USDT,
]

const lineaTokens = [
  ADDRESSES.null,
  ADDRESSES.linea.USDC,
  ADDRESSES.linea.USDT,
]

const modeTokens = [
  ADDRESSES.null,
  ADDRESSES.mode.USDC,
  ADDRESSES.mode.USDT
]

const scrollTokens = [
  ADDRESSES.null,
  ADDRESSES.scroll.USDC,
  ADDRESSES.scroll.USDT
]

module.exports = {
  start: 1685817000,
  ethereum: { tvl: sumTokensExport({ owners: ethereumContracts, tokens: ethereumTokens, }) },
  polygon: { tvl: sumTokensExport({ owners: polygonContracts, tokens: polygonTokens}) },
  optimism: { tvl: sumTokensExport({ owners: optimismContracts, tokens: optimismTokens}) },
  arbitrum: { tvl: sumTokensExport({ owners: arbitrumContracts, tokens: arbitrumTokens}) },
  linea: { tvl: sumTokensExport({ owners: lineaContracts, tokens: lineaTokens}) },
  mode: { tvl: sumTokensExport({ owners: modeContracts, tokens: modeTokens}) },
  scroll: { tvl: sumTokensExport({ owners: scrollContracts, tokens: scrollTokens}) },
};
