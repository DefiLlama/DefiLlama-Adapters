// Candidate for DefiLlama-Adapters/projects/biribi/index.js.
// TVL is actual custody, including temporarily locked wagers/reserves.
// It is not ERC-4626 totalAssets(), LP NAV, or withdrawable liquidity.
const { sumTokensExport } = require("../helper/unwrapLPs");

const BRB = "0x58871cf545f8f0df790443492a80edc414df4504";
const USDC = "0xaf88d065e77c8cc2239327c5edb3a432268e5831";
const DAI = "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1";
const BRB_BANK = "0x5f9332b04b2590850c7681850ca445ddf7f64aa9";
const USDC_BANK = "0x46206b1c1fc631fd6fcf2aa2503f9cb022da96ba";
const DAI_BANK = "0x137dd55e422b1881ad1566ce21e2e4f393bb37b2";

module.exports = {
  methodology: "TVL counts USDC and DAI balances held by their respective bankroll vaults, including locked wagers and reserves. Own-token BRB custody is reported separately as staking. No engine balance, vault receipt token, jackpot treasury or external DEX liquidity is added. TVL is gross custody, not LP NAV or instant withdrawal liquidity.",
  arbitrum: {
    tvl: sumTokensExport({ tokensAndOwners: [[USDC, USDC_BANK], [DAI, DAI_BANK]] }),
    staking: sumTokensExport({ tokensAndOwners: [[BRB, BRB_BANK]] }),
  },
};
