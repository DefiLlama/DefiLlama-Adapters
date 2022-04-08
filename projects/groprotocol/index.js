// Adapter for Gro Protocol : https://gro.xyz

const sdk = require("@defillama/sdk");
const { sumBalancerLps } = require("../helper/unwrapLPs");
const { unwrapUniswapLPs, unwrapCrvLPs } = require("./helpers");
const { getBlock } = require("../helper/getBlock");
const { transformAvaxAddress } = require("../helper/portedTokens");

const groTokenAbi = require("./abi.json");
const { stakings } = require("../helper/staking");

// Gro Protocol Token Addresses
const GRO = "0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7"; // Governance Token, not counted for TVL unless staked in pools
const GVT = "0x3ADb04E127b9C0a5D36094125669d4603AC52a0c"; // Protocol token representing share of assets, fully count
const PWRD = "0xf0a93d4994b3d98fb5e3a2f90dbc2d69073cb86b"; // Protocol token representing share of assets, fully count

// Gro Protocol LP Pool Addresses
const PO_SS_GRO = "0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7"; // Count only if staked
const P1_UNI_GRO_GVT = "0x2ac5bC9ddA37601EDb1A5E29699dEB0A5b67E9bB"; // Count non-GVT assets and only if staked
const P2_UNI_GRO_USDC = "0x21C5918CcB42d20A2368bdCA8feDA0399EbfD2f6"; // Count only if staked
const P3_SS_GVT = "0x3ADb04E127b9C0a5D36094125669d4603AC52a0c"; // Ignore as GVT already counted
const P4_CRV_PWRD_TCRV = "0xbcb91E689114B9Cc865AD7871845C95241Df4105"; // Count non-PWRD assets and only if staked
const P5_BAL_GRO_WETH = "0x702605f43471183158938c1a3e5f5a359d7b31ba"; // Count only if staked

// Other Token Addresses
const TCRV = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490"; // Count if staked
const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // Count if staked
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // Count if staked
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // Count if staked
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"; // Count if staked

// Contract Addresses
const GROTokenStaker1 = "0x001C249c09090D79Dc350A286247479F08c7aaD7";
const GROTokenStaker2 = "0x2E32bAd45a1C29c1EA27cf4dD588DF9e68ED376C";

async function tvl(timestamp, ethBlock) {
  let balances = {};
  const crvLpPositions = [];

  if (timestamp < 1633046400) {
    // Before 01-10-2021
    // Prior to this point no pools and no pricing on Coingecko so use 18 decimal DAI as a $1.00 proxy

    for (const token of [PWRD, GVT]) {
      const current = await sdk.api.abi.call({
        target: token,
        abi: groTokenAbi["totalAssets"],
        block: ethBlock,
      });
      // Treat amounts as if in DAI. Calls to totalAssets() return USD amount
      sdk.util.sumSingleBalance(balances, DAI, current.output);
    }
  } else {
    // On or after 01-10-2021
    // Can output PWRD and GVT balances directly as Coingecko can price the tokens

    // Assets held within PWRD and GVT directly
    for (const token of [PWRD, GVT]) {
      const current = await sdk.api.abi.call({
        target: token,
        abi: groTokenAbi["totalSupply"],
        block: ethBlock,
      });
      sdk.util.sumSingleBalance(balances, token, current.output);
    }

    // Assets held in staking pools (not counting any PWRD or GVT assets as these are already counted)

    // P3_SS_GVT - GVT already accounted for

    // P4_CRV_PWRD_TCRV
    const p4a = await sdk.api.erc20.balanceOf({
      target: P4_CRV_PWRD_TCRV,
      owner: GROTokenStaker1,
      block: ethBlock,
    });
    crvLpPositions.push({ token: P4_CRV_PWRD_TCRV, balance: p4a.output });

    // P4_CRV_PWRD_TCRV
    const p4b = await sdk.api.erc20.balanceOf({
      target: P4_CRV_PWRD_TCRV,
      owner: GROTokenStaker2,
      block: ethBlock,
    });
    crvLpPositions.push({ token: P4_CRV_PWRD_TCRV, balance: p4b.output });

    await unwrapCrvLPs(
      balances,
      crvLpPositions,
      ethBlock,
      "ethereum",
      undefined,
      [PWRD]
    ); // Excludes already counted PWRD amount
  }

  return balances;
}
async function pool2(timestamp, ethBlock) {
  let balances = {};
  balances = await tokenStaker(timestamp, ethBlock, balances, GROTokenStaker1);
  return await tokenStaker(timestamp, ethBlock, balances, GROTokenStaker2);
}
async function tokenStaker(timestamp, ethBlock, balances, GROTokenStaker) {
  const uniLpPositions = [];
  const balLpPositions = [];
  // P1_UNI_GRO_GVT
  // P2_UNI_GRO_USDC
  const p1 = (
    await sdk.api.erc20.balanceOf({
      target: P1_UNI_GRO_GVT,
      owner: GROTokenStaker,
      block: ethBlock,
    })
  ).output;
  uniLpPositions.push({ token: P1_UNI_GRO_GVT, balance: p1 });

  const p2 = (
    await sdk.api.erc20.balanceOf({
      target: P2_UNI_GRO_USDC,
      owner: GROTokenStaker,
      block: ethBlock,
    })
  ).output;
  uniLpPositions.push({ token: P2_UNI_GRO_USDC, balance: p2 });

  await unwrapUniswapLPs(
    balances,
    uniLpPositions,
    ethBlock,
    "ethereum",
    undefined,
    [GVT]
  ); // Excludes already counted GVT amount
  // P5_BAL_GRO_WETH
  if (timestamp > 1633392000) {
    // On or after 05-10-2021, P5 pool available
    const p5 = await sdk.api.erc20.balanceOf({
      target: P5_BAL_GRO_WETH,
      owner: GROTokenStaker,
      block: ethBlock,
    });
    balLpPositions.push({ P5_BAL_GRO_WETH, p5 });

    await sumBalancerLps(
      balances,
      [[P5_BAL_GRO_WETH, GROTokenStaker, true]],
      ethBlock,
      "ethereum",
      (addr) => addr.toLowerCase(addr)
    );
  }
  return balances;
}

const labs = [
  {
    // USDC
    vault: "0x57DaED1ee021BE9991F5d30CF494b6B09B5B449E",
    baseToken: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
  },
  {
    // DAI
    vault: "0x5E57E11483A3F60A76af3045303604522059dA2a",
    baseToken: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
  },
  {
    // USDT
    vault: "0x471F4B4b9A97F82C3a25b034B33A8E306eE9Beb5",
    baseToken: "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",
  },
  {
    // USDC
    vault: "0x2Eb05cfFA24309b9aaf300392A4D8Db745d4E592",
    baseToken: "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664",
  },
  {
    // DAI
    vault: "0x6063597B9356B246E706Fd6A48C780F897e3ef55",
    baseToken: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
  },
  {
    // USDT
    vault: "0x6EF44077a1F5e10cDfcCc30EFb7dCdb1d5475581",
    baseToken: "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",
  },
];

async function avaxTvl(timestamp, block, chainBlocks) {
  let balances = {};
  block = await getBlock(timestamp, "avax", chainBlocks);
  const transform = await transformAvaxAddress();
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
    staking: stakings([ GROTokenStaker1, GROTokenStaker2 ], GRO),
    tvl,
  },
  avalanche: {
    tvl: avaxTvl,
  },
  start: 1622204347, // 28-05-2021 12:19:07 (UTC)
  methodology:
    "Assets held within the GRO Protocol - either within the PWRD or Vault (GVT) products, or staked in the Gro Protocol pools. Avax TVL is the sum of tokens locked in Gro Labs.",
};
