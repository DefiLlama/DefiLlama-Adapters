// AUTO-GENERATED — scripts/defillama/generate-bridge-tvl-adapter.py
// GRU bridge locked collateral: hub c* escrow (source chain) + CCIP WETH lock boxes.
// cW* on destination chains are minted transport — not counted (DefiLlama bridge methodology).
// Regenerate after config/defillama-bridge-collateral-manifest.json changes.

const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

const HUB_C_TOKENS = [
    "0x003960f16D9d34F2e98d62723B6721Fb92074aD2",
    "0x290E52a8819A4fbD0714E517225429aA2B70EC6b",
    "0x350f54e4D23795f86A9c03988c7135357CCaD97c",
    "0x54dBd40cF05e15906A2C21f600937e96787f5679",
    "0x8085961F9cF02b4d800A3c6d386D31da4B34266a",
    "0x873990849DDa5117d7C644f0aF24370797C03885",
    "0x93E66202A11B1772E55407B32B44e5Cd8eda7f22",
    "0x94e408E26c6FD8F4ee00b54dF19082FDA07dC96E",
    "0xb7721dD53A8c629d9f1Ba31a5819AFe250002b03",
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0xD51482e567c03899eecE3CAe8a058161FD56069D",
    "0xdf4b71c61E5912712C1Bdd451416B9aC26949d72",
    "0xe94260c555ac1d9d3cc9e1632883452ebdf0082e",
    "0xEe269e1226a334182aace90056EE4ee5Cc8A6770",
    "0xf22258f57794CC8E06237084b353Ab30fFfa640b",
    "0xf4BB2e28688e89fCcE3c0580D37d36A7672E8A9f",
  ];

const HUB_OWNERS = [
  "0x152ed3e9912161b76bdfd368d0c84b7c31c10de7",
  "0xcacfd227A040002e49e2e01626363071324f820a",
  "0xe0E93247376aa097dB308B92e6Ba36bA015535D0",
  "0xFce6f50B312B3D936Ea9693C5C9531CF92a3324c",
  "0x66FEBA2fC9a0B47F26DD4284DAd24F970436B8Dc",
  "0x31884f84555210FFB36a19D2471b8eBc7372d0A8",
  "0x607e97cD626f209facfE48c1464815DDE15B5093",
  "0x34B73e6EDFd9f85a7c25EeD31dcB13aB6E969b96"
];

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology:
    "TVL is ERC-20 (and native where applicable) balances held in deployed GRU bridge contracts. " +
    "c* hub collateral on dfio_meta_main (Chain 138) backs cW* mints on destination chains — " +
    "only source-chain escrow is counted, not minted cW* on L2. CCIP WETH9/WETH10 lock boxes " +
    "on each chain hold corridor WETH separately. DODO AMM liquidity is separate.",

  dfio_meta_main: {
    tvl: sumTokensExport({
      owners: HUB_OWNERS,
      tokens: HUB_C_TOKENS,
      logCalls: true,
    }),
  },

  ethereum: {
    tvl: sumTokensExport({
      owners: ["0xF9A32F37099c582D28b4dE7Fca6eaC1e5259f939", "0xc9901ce2Ddb6490FAA183645147a87496d8b20B6", "0x04E1e22B0D41e99f4275bd40A50480219bc9A223"],
      tokens: [ADDRESSES.ethereum.WETH],
      logCalls: true,
    }),
  },


};
