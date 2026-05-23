// AUTO-GENERATED — scripts/defillama/generate-bridge-tvl-adapter.py
// GRU bridge locked collateral (hub c* escrow + CCIP WETH + Mainnet cW* L2 bridge)
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

const MAINNET_CW = [
    "0x07EEd0D7dD40984e47B9D3a3bdded1c536435582",
    "0x0F91C5E6Ddd46403746aAC970D05d70FFe404780",
    "0x1dDF9970F01c76A692Fdba2706203E6f16e0C46F",
    "0x209FE32fe7B541751D190ae4e50cd005DcF8EDb4",
    "0x2de5F116bFcE3d0f922d9C8351e0c5Fc24b9284a",
    "0x5020Db641B3Fc0dAbBc0c688C845bc4E3699f35F",
    "0x572Be0fa8CA0534d642A567CEDb398B771D8a715",
    "0x855d74FFB6CF75721a9bAbc8B2ed35c8119241dC",
    "0xACE1DBF857549a11aF1322e1f91F2F64b029c906",
    "0xaF5017d0163ecb99D9B5D94e3b4D7b09Af44D8AE",
    "0xc074007dc0bfb384b1cf6426a56287ed23fe4d52",
    "0xD4aEAa8cD3fB41Dc8437FaC7639B6d91B60A5e8d",
  ];

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology:
    "TVL is ERC-20 (and native where applicable) balances held in deployed GRU bridge contracts: " +
    "Chain 138 hub escrow (CWMultiTokenBridgeL1, vaults, CCIP WETH bridges), Mainnet cW L2 bridge, " +
    "and per-chain CCIP WETH lock boxes. c* hub collateral backs cW* mints; DODO AMM liquidity is separate.",

  dfio_meta_main: {
    tvl: sumTokensExport({
      owners: HUB_OWNERS,
      tokens: HUB_C_TOKENS,
      logCalls: true,
    }),
  },

  ethereum: {
    tvl: sumTokensExport({
      owners: ["0x2bF74583206A49Be07E0E8A94197C12987AbD7B5", "0xF9A32F37099c582D28b4dE7Fca6eaC1e5259f939", "0xc9901ce2Ddb6490FAA183645147a87496d8b20B6", "0x04E1e22B0D41e99f4275bd40A50480219bc9A223"],
      tokens: [...MAINNET_CW, ADDRESSES.ethereum.WETH],
      logCalls: true,
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      owners: ["0x886C6A4ABC064dbf74E7caEc460b7eeC31F1b78C", "0x937824f2516fa58f25aeAb92E7BFf7D74F463B4c"],
      tokens: ["0xe0E93247376aa097dB308B92e6Ba36bA015535D0", "0xAb57BF30F1354CA0590af22D8974c7f24DB2DbD7"],
      logCalls: true,
    }),
  },
  polygon: {
    tvl: sumTokensExport({
      owners: ["0xF7736443f02913e7e0773052103296CfE1637448", "0x0CA60e6f8589c540200daC9D9Cb27BC2e48eE66A"],
      tokens: ["0x24293CA562aE1100E60a4640FF49bd656cFf93B4", "0x937824f2516fa58f25aeAb92E7BFf7D74F463B4c"],
      logCalls: true,
    }),
  },
  avax: {
    tvl: sumTokensExport({
      owners: ["0x3f8C409C6072a2B6a4Ff17071927bA70F80c725F", "0x937824f2516fa58f25aeAb92E7BFf7D74F463B4c"],
      tokens: ["0xa4B9DD039565AeD9641D45b57061f99d9cA6Df08", "0x89dd12025bfCD38A168455A44B400e913ED33BE2"],
      logCalls: true,
    }),
  },
  base: {
    tvl: sumTokensExport({
      owners: ["0x24293CA562aE1100E60a4640FF49bd656cFf93B4", "0x937824f2516fa58f25aeAb92E7BFf7D74F463B4c"],
      tokens: ["0xe0E93247376aa097dB308B92e6Ba36bA015535D0", "0xAb57BF30F1354CA0590af22D8974c7f24DB2DbD7"],
      logCalls: true,
    }),
  },
  arbitrum: {
    tvl: sumTokensExport({
      owners: ["0x937824f2516fa58f25aeAb92E7BFf7D74F463B4c", "0x73376eB92c16977B126dB9112936A20Fa0De3442"],
      tokens: ["0x89dd12025bfCD38A168455A44B400e913ED33BE2", "0xe0E93247376aa097dB308B92e6Ba36bA015535D0"],
      logCalls: true,
    }),
  },
  optimism: {
    tvl: sumTokensExport({
      owners: ["0x6e94e53F73893b2a6784Df663920D31043A6dE07", "0x24293CA562aE1100E60a4640FF49bd656cFf93B4"],
      tokens: ["0x89dd12025bfCD38A168455A44B400e913ED33BE2", "0xe0E93247376aa097dB308B92e6Ba36bA015535D0"],
      logCalls: true,
    }),
  },
  xdai: {
    tvl: sumTokensExport({
      owners: ["0xc8656F24488cb90c452058da92d1a25BA464eaAE", "0xa846aeAD3071df1b6439d5D813156aCE7C2c1DA1"],
      tokens: ["0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d"],
      logCalls: true,
    }),
  },
  cronos: {
    tvl: sumTokensExport({
      owners: ["0x3Cc23d086fCcbAe1e5f3FE2bA4A263E1D27d8Cab", "0x105F8A15b819948a89153505762444Ee9f324684"],
      tokens: ["0x99B3511A2d315A497C8112C1fdd8D508d4B1E506", "0x3304b747E565a97ec8AC220b0B6A1f6ffDB837e6"],
      logCalls: true,
    }),
  },
  celo: {
    tvl: sumTokensExport({
      owners: ["0xAb57BF30F1354CA0590af22D8974c7f24DB2DbD7", "0xa780ef19A041745d353c9432f2a7f5A241335ffE"],
      tokens: ["0x2021B12D8138e2D63cF0895eccABC0DFc92416c6"],
      logCalls: true,
    }),
  },
  wemix: {
    tvl: sumTokensExport({
      owners: ["0xD3AD6831aacB5386B8A25BB8D8176a6C8a026f04", "0xa4B9DD039565AeD9641D45b57061f99d9cA6Df08"],
      tokens: ["0x7D72b22a74A216Af4a002a1095C8C707d6eC1C5f"],
      logCalls: true,
    }),
  },
};
