/**
 * lp token addresses
 */
// USD1
const USD1_DAIe_LP = "0xc1Daa16E6979C2D1229cB1fd0823491eA44555Be";
const USD1_USDC_LP = "0xAEf735B1E7EcfAf8209ea46610585817Dc0a2E16";
const USD1_USDCe_LP = "0x909B0ce4FaC1A0dCa78F8Ca7430bBAfeEcA12871";
const USD1_USDT_LP = "0x776628A5C37335608DD2a9538807b9bba3869E14";
const USD1_USDTe_LP = "0x0D26D103c91F63052Fbca88aAF01d5304Ae40015";
const USD1_MIM_LP = "0x6220BaAd9D08Dee465BefAE4f82ee251cF7c8b82";
// USD2
const USD2_USDC_FRAX_LP = "0x035D7D7F209B5d18e2AB5C2072E85B32e1D43760";
const USD2_USDC_UST_LP = "0xFC95481F79eC965A535Ed8cef4630e1dd308d319";
const USD2_USDC_MIM_LP = "0x4E5704991b43C1D33b9Ccd1BC33B211bf068385A";
const USD2_UST_LP = "0xc7388D98Fa86B6639d71A0A6d410D5cDfc63A1d0";
const USD2_FRAX_LP = "0x6FD4b4c38ED80727EcD0d58505565F9e422c965f";
const USD2_MIM_LP = "0xF01cEA00598d87Cb9792a01B040d04b0bd8Ca781";
// sAVAX - WAVAX
const WAVAX_LP = "0xC73eeD4494382093C6a7C284426A9a00f6C79939";
const SAVAX_LP = "0xA2A7EE49750Ff12bb60b407da2531dB3c50A1789";
/**
 * token addresses
 */
const DAIe = "0xd586e7f844cea2f87f50152665bcbc2c279d8d70";
const USDC = "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E";
const USDCe = "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664";
const USDT = "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7";
const USDTe = "0xc7198437980c041c805a1edcba50c1ce5db95118";
const MIM = "0x130966628846bfd36ff31a822705796e8cb8c18d";
const UST = "0xb599c3590F42f8F995ECfa0f85D2980B76862fc1";
const FRAX = "0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64";
const WAVAX = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7";
const SAVAX = "0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE";

module.exports = {
  DAI: {
    id: "dai",
    addresses: [
      {
        token: DAIe,
        lpTokens: [USD1_DAIe_LP],
      },
    ],
  },
  USDC: {
    id: "usd-coin",
    addresses: [
      {
        token: USDC,
        lpTokens: [
          USD1_USDC_LP,
          USD2_USDC_FRAX_LP,
          USD2_USDC_UST_LP,
          USD2_USDC_MIM_LP,
        ],
      },
    ],
  },
  USDCe: {
    id: "usd-coin-avalanche-bridged-usdc-e",
    addresses: [
      {
        token: USDCe,
        lpTokens: [USD1_USDCe_LP],
      },
    ],
  },
  USDT: {
    id: "tether",
    addresses: [
      {
        token: USDT,
        lpTokens: [USD1_USDT_LP],
      },
      {
        token: USDTe,
        lpTokens: [USD1_USDTe_LP],
      },
    ],
  },
  MIM: {
    id: "magic-internet-money",
    addresses: [
      {
        token: MIM,
        lpTokens: [USD1_MIM_LP, USD2_MIM_LP],
      },
    ],
  },
  UST: {
    id: "terrausd-wormhole",
    addresses: [
      {
        token: UST,
        lpTokens: [USD2_UST_LP],
      },
    ],
  },
  FRAX: {
    id: "frax",
    addresses: [
      {
        token: FRAX,
        lpTokens: [USD2_FRAX_LP],
      },
    ],
  },
  WAVAX: {
    id: "wrapped-avax",
    addresses: [
      {
        token: WAVAX,
        lpTokens: [WAVAX_LP],
      },
    ],
  },
  SAVAX: {
    id: "benqi-liquid-staked-avax",
    addresses: [
      {
        token: SAVAX,
        lpTokens: [SAVAX_LP],
      },
    ],
  },
};
