const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");
const { sumTokens2 } = require("../helper/solana");

const VAULT = "0x816f722424B49Cf1275cc86DA9840Fbd5a6167e9";
const ABSTRACT_VAULT = "0xE80F2396A266e898FBbD251b89CFE65B3e41fD18";
const SOLANA_VAULT = "2AoLiH5kVBG2ot1qKoh4ro8F95KQb7HEBbJmkxrwYBec";

const config = {
  ethereum: {
    owners: [VAULT],
    tokens: [
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.WBTC,
      "0x4274cd7277c7bb0806bd5fe84b9adae466a8da0a", // YUSD
      "0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d", // USD1
    ],
  },
  bsc: {
    owners: [VAULT],
    tokens: [
      ADDRESSES.bsc.USDC,
      ADDRESSES.bsc.USDT,
      "0xAB3dBcD9B096C3fF76275038bf58eAC10D22C61f", // YUSD
      ADDRESSES.bsc.USD1,
    ],
  },
  arbitrum: {
    owners: [VAULT],
    tokens: [ADDRESSES.arbitrum.USDC_CIRCLE, ADDRESSES.arbitrum.USDT],
  },
  optimism: {
    owners: [VAULT],
    tokens: [ADDRESSES.optimism.USDC_CIRCLE],
  },
  base: {
    owners: [VAULT],
    tokens: [ADDRESSES.base.USDC],
  },
  mantle: {
    owners: [VAULT],
    tokens: [ADDRESSES.mantle.USDC],
  },
  avax: {
    owners: [VAULT],
    tokens: [ADDRESSES.avax.USDC],
  },
  polygon: {
    owners: [VAULT],
    tokens: [ADDRESSES.polygon.USDC_CIRCLE, ADDRESSES.polygon.USDT],
  },
  sei: {
    owners: [VAULT],
    tokens: [ADDRESSES.sei.USDC_Circle],
  },
  sonic: {
    owners: [VAULT],
    tokens: [ADDRESSES.sonic.USDC_e],
  },
  berachain: {
    owners: [VAULT],
    tokens: [ADDRESSES.berachain.USDC],
  },
  mode: {
    owners: [VAULT],
    tokens: [ADDRESSES.mode.USDC],
  },
  morph: {
    owners: [VAULT],
    tokens: [ADDRESSES.morph.USDC, ADDRESSES.morph.USDT],
  },
  sty: {
    owners: [VAULT],
    tokens: [ADDRESSES.sty.USDC_e],
  },
  adi: {
    owners: [VAULT],
    tokens: [ADDRESSES.adi.USDC_e],
  },
  abstract: {
    owners: [ABSTRACT_VAULT],
    tokens: [ADDRESSES.abstract.USDC, ADDRESSES.abstract.USDT],
  },
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl: sumTokensExport(config[chain]) };
});

module.exports.solana = {
  tvl: (api) =>
    sumTokens2({
      api,
      owner: SOLANA_VAULT,
      tokens: [ADDRESSES.solana.USDC, ADDRESSES.solana.USDT],
    }),
};

module.exports.doublecounted = true;
module.exports.methodology =
  "TVL is the balance of collateral tokens held in IOTrader vault contracts across all supported chains.";
