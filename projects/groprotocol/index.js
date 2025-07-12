// Adapter for Gro Protocol : https://gro.xyz

const { sumTokens2, } = require("../helper/unwrapLPs");

const { stakings } = require("../helper/staking");
const { sumERC4626VaultsExport } = require("../helper/erc4626");

// Gro Protocol Token Addresses
const GRO = "0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7"; // Governance Token, not counted for TVL unless staked in pools
const GVT = "0x3ADb04E127b9C0a5D36094125669d4603AC52a0c"; // Protocol token representing share of assets, fully count
const PWRD = "0xf0a93d4994b3d98fb5e3a2f90dbc2d69073cb86b"; // Protocol token representing share of assets, fully count

// Gro Protocol LP Pool Addresses
const P1_UNI_GRO_GVT = "0x2ac5bC9ddA37601EDb1A5E29699dEB0A5b67E9bB"; // Count non-GVT assets and only if staked
const P2_UNI_GRO_USDC = "0x21C5918CcB42d20A2368bdCA8feDA0399EbfD2f6"; // Count only if staked
const P4_CRV_PWRD_TCRV = "0xbcb91E689114B9Cc865AD7871845C95241Df4105"; // Count non-PWRD assets and only if staked
const P5_BAL_GRO_WETH = "0x702605f43471183158938c1a3e5f5a359d7b31ba"; // Count only if staked

// Contract Addresses
const GROTokenStaker1 = "0x001C249c09090D79Dc350A286247479F08c7aaD7";
const GROTokenStaker2 = "0x2E32bAd45a1C29c1EA27cf4dD588DF9e68ED376C";

async function tvl(api) {
  const tokens = [PWRD, GVT]
  const supplies = await api.multiCall({  abi: 'erc20:totalSupply', calls: tokens})
  api.add(tokens, supplies)
}

async function pool2(api) {
  return sumTokens2({
    api,
    owners: [GROTokenStaker1, GROTokenStaker2],
    tokens: [
      P4_CRV_PWRD_TCRV,
      P1_UNI_GRO_GVT,
      P2_UNI_GRO_USDC,
      P5_BAL_GRO_WETH,
    ],
  })
}

const labs = [
  "0x57DaED1ee021BE9991F5d30CF494b6B09B5B449E",      // USDC
  "0x5E57E11483A3F60A76af3045303604522059dA2a",      // DAI
  "0x471F4B4b9A97F82C3a25b034B33A8E306eE9Beb5",      // USDT
  "0x2Eb05cfFA24309b9aaf300392A4D8Db745d4E592",      // USDC
  "0x6063597B9356B246E706Fd6A48C780F897e3ef55",      // DAI
  "0x6EF44077a1F5e10cDfcCc30EFb7dCdb1d5475581",      // USDT
]

module.exports = {
  ethereum: {
    pool2,
    staking: stakings([GROTokenStaker1, GROTokenStaker2], GRO),
    tvl,
  },
  avax: {
    tvl: sumERC4626VaultsExport({ vaults: labs, tokenAbi: 'token', balanceAbi: 'totalAssets' }),
  },
  start: '2021-05-28', // 28-05-2021 12:19:07 (UTC)
  methodology:
    "Assets held within the GRO Protocol - either within the PWRD or Vault (GVT) products, or staked in the Gro Protocol pools. Avax TVL is the sum of tokens locked in Gro Labs.",
};
