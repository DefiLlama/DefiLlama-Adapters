const ADDRESSES = require('../helper/coreAssets.json')
// Adapter for Gro Protocol : https://gro.xyz

const sdk = require("@defillama/sdk");
const { sumTokens2, } = require("../helper/unwrapLPs");

const groTokenAbi = require("./abi.json");
const { stakings } = require("../helper/staking");

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
  let balances = {};

  // Assets held within PWRD and GVT directly
  for (const token of [PWRD, GVT]) {
    const current = await api.call({
      target: token,
      abi: groTokenAbi["totalSupply"],
    });
    sdk.util.sumSingleBalance(balances, token, current);
  }

  return balances
}

async function pool2(api) {
  return sumTokens2({
    api,
    owners: [GROTokenStaker1,GROTokenStaker2 ],
    tokens: [
      P4_CRV_PWRD_TCRV,
      P1_UNI_GRO_GVT,
      P2_UNI_GRO_USDC,
      P5_BAL_GRO_WETH,
      P5_BAL_GRO_WETH,
    ],
  })
}

const labs = [
  {
    // USDC
    vault: "0x57DaED1ee021BE9991F5d30CF494b6B09B5B449E",
    baseToken: ADDRESSES.avax.USDC_e,
  },
  {
    // DAI
    vault: "0x5E57E11483A3F60A76af3045303604522059dA2a",
    baseToken: ADDRESSES.avax.DAI,
  },
  {
    // USDT
    vault: "0x471F4B4b9A97F82C3a25b034B33A8E306eE9Beb5",
    baseToken: ADDRESSES.avax.USDT_e,
  },
  {
    // USDC
    vault: "0x2Eb05cfFA24309b9aaf300392A4D8Db745d4E592",
    baseToken: ADDRESSES.avax.USDC_e,
  },
  {
    // DAI
    vault: "0x6063597B9356B246E706Fd6A48C780F897e3ef55",
    baseToken: ADDRESSES.avax.DAI,
  },
  {
    // USDT
    vault: "0x6EF44077a1F5e10cDfcCc30EFb7dCdb1d5475581",
    baseToken: ADDRESSES.avax.USDT_e,
  },
];

async function avaxTvl(timestamp, _, { avax: block }) {
  let balances = {};
  const transform = addr => 'avax:'+addr
  const totalAssets = (
    await sdk.api.abi.multiCall({
      calls: labs.map((l) => ({ target: l.vault })),
      abi: groTokenAbi.totalAssets,
      block,
      chain: "avax",
    })
  ).output;

  for (let i = 0; i < labs.length; i++) {
    sdk.util.sumSingleBalance(
      balances,
      transform(labs[i].baseToken),
      totalAssets[i].output
    );
  }
  return balances;
}

module.exports = {
  ethereum: {
    pool2,
    staking: stakings([GROTokenStaker1, GROTokenStaker2], GRO),
    tvl,
  },
  avax: {
    tvl: avaxTvl,
  },
  start: 1622204347, // 28-05-2021 12:19:07 (UTC)
  methodology:
    "Assets held within the GRO Protocol - either within the PWRD or Vault (GVT) products, or staked in the Gro Protocol pools. Avax TVL is the sum of tokens locked in Gro Labs.",
};
