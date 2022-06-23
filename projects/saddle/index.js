/*==================================================
  Modules
  ==================================================*/
const axios = require("axios");
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

/*** Ethereum Addresses ***/
const btcPoolAddress = "0x4f6A43Ad7cba042606dECaCA730d4CE0A57ac62e";
const usdPoolAddress = "0x3911f80530595fbd01ab1516ab61255d75aeb066";
const veth2PoolAddress = "0xdec2157831D6ABC3Ec328291119cc91B337272b5";
const alethPoolAddress = "0xa6018520eaacc06c30ff2e1b3ee2c7c22e64196a";
const usdV2PoolAddress = "0xaCb83E0633d6605c5001e2Ab59EF3C745547C8C7";
const susdPoolAddress = "0x0C8BAe14c9f9BF2c953997C881BEfaC7729FD314";
const veth2 = "0x898BAD2774EB97cF6b94605677F43b41871410B1";
const weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const d4Pool = "0xc69ddcd4dfef25d8a793241834d4cc4b3668ead6";
const btcV2PoolAddress = "0xdf3309771d2BF82cb2B6C56F9f5365C8bD97c4f2";
const tbtcV2MetapoolAddress = "0xf74ebe6e5586275dc4CeD78F5DBEF31B1EfbE7a5";
const wcusdMetapoolAddress = "0x3F1d224557afA4365155ea77cE4BC32D5Dae2174";
const frax3PoolAddress = "0x8cAEa59f3Bf1F341f89c51607E4919841131e47a";

const tokens = {
  // TBTC
  "0x8dAEBADE922dF735c38C80C7eBD708Af50815fAa": [btcPoolAddress],
  // RENBTC
  "0xeb4c2781e4eba804ce9a9803c67d0893436bb27d": [
    btcPoolAddress,
    btcV2PoolAddress,
  ],
  // WBTC
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": [
    btcPoolAddress,
    btcV2PoolAddress,
  ],
  // SBTC
  "0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6": [
    btcPoolAddress,
    btcV2PoolAddress,
  ],
  // DAI
  "0x6B175474E89094C44Da98b954EedeAC495271d0F": [
    usdPoolAddress,
    usdV2PoolAddress,
  ],
  // USDC
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": [
    usdPoolAddress,
    usdV2PoolAddress,
    frax3PoolAddress,
  ],
  // USDT
  "0xdAC17F958D2ee523a2206206994597C13D831ec7": [
    usdPoolAddress,
    usdV2PoolAddress,
    frax3PoolAddress,
  ],
  // SUSD
  "0x57ab1ec28d129707052df4df418d58a2d46d5f51": [susdPoolAddress],
  // WETH
  [weth]: [veth2PoolAddress, alethPoolAddress],
  // VETH2
  [veth2]: [veth2PoolAddress],
  // alETH
  "0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6": [alethPoolAddress],
  // SETH
  "0x5e74C9036fb86BD7eCdcb084a0673EFc32eA31cb": [alethPoolAddress],
  // tBTCv2
  "0x18084fba666a33d37592fa2633fd49a74dd93a88": [tbtcV2MetapoolAddress],
  // WCUSD
  "0xad3e3fc59dff318beceaab7d00eb4f68b1ecf195": [wcusdMetapoolAddress],
  // FRAX
  "0x853d955aCEf822Db058eb8505911ED77F175b99e": [frax3PoolAddress],
};

/*** Fantom Addresses ***/
const fantom_usdPoolAddress = "0xBea9F78090bDB9e662d8CB301A00ad09A5b756e9";
const fantom_usdc = "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75";
const fantom_frax = "0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355";

const fantom_tokens = {
  [fantom_usdc]: [fantom_usdPoolAddress],
  [fantom_frax]: [fantom_usdPoolAddress],
};

/*** Arbitrum Addresses ***/
const poolAddresses_arb = [
  //ArbUSDPoolAddress
  "0xBea9F78090bDB9e662d8CB301A00ad09A5b756e9",
  //ArbFRAXPoolContract
  "0xfeEa4D1BacB0519E8f952460A70719944fe56Ee0",
  //ArbUSDSarbUSDv2Meta
  "0x5dD186f8809147F96D3ffC4508F3C82694E58c9c",
];
const MIM_arb = "0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a";
const USDT_arb = "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9";
const USDC_arb = "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8";
const nUSD_arb = "0x2913e812cf0dcca30fb28e6cac3d2dcff4497688";
const FRAX_arb = "0x17fc002b466eec40dae837fc4be5c67993ddbd6f";
const USDS_arb = "0xD74f5255D557944cf7Dd0E45FF521520002D5748";

/*** Optimism Addresses ***/
const poolAddresses_opt = [
  //OptUSDPoolAddress
  "0x5847f8177221268d279Cf377D0E01aB3FD993628",
  //OptFRAXPoolContract
  "0xc55E8C79e5A6c3216D4023769559D06fa9A7732e",
];
const DAI_opt = "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1";
const USDT_opt = "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58";
const USDC_opt = "0x7f5c764cbc14f9669b88837ca1490cca17c31607";
const FRAX_opt = "0x2e3d870790dc77a83dd1d18184acc7439a53f475";

/*** Evmos Addresses ***/
const poolAddresses_evm = [
  //EvmosFrax3pool
  "0x21d4365834B7c61447e142ef6bCf01136cBD01c6",
];
const FRAX_evm = "0xe03494d0033687543a80c9b1ca7d6237f2ea8bd8";
const USDC_evm = "0x51e44ffad5c2b122c8b635671fcc8139dc636e82";
const USDT_evm = "0x7ff4a56b32ee13d7d4d405887e0ea37d61ed919e";

/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block) {
  let balances = {};
  let calls = [];

  for (const token in tokens) {
    for (const poolAddress of tokens[token])
      calls.push({
        target: token,
        params: poolAddress,
      });
  }

  // Pool Balances
  let balanceOfResults = await sdk.api.abi.multiCall({
    block,
    calls: calls,
    abi: "erc20:balanceOf",
  });

  // Compute Balances
  balanceOfResults.output.forEach((balanceOf) => {
    let address = balanceOf.input.target;
    let amount = balanceOf.output;
    if (balanceOf.input.params[0] === veth2PoolAddress) {
      if (address === veth2) {
        return;
      } else {
        amount = BigNumber(amount).times(2).toFixed();
      }
    }
    balances[address] = BigNumber(balances[address] || 0)
      .plus(amount)
      .toFixed();
  });

  let d4Tokens = (
    await axios.get(
      `https://api.covalenthq.com/v1/1/address/${d4Pool}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`
    )
  ).data.data.items;

  await Promise.all(
    d4Tokens.map(async (token) => {
      if (token.supports_erc) {
        const singleTokenLocked = sdk.api.erc20.balanceOf({
          target: token.contract_address,
          owner: d4Pool,
          block: block,
        });
        sdk.util.sumSingleBalance(
          balances,
          token.contract_address,
          (await singleTokenLocked).output
        );
      }
    })
  );

  return balances;
}

async function tvlFantom(timestamp, block) {
  let balances = {};
  let rawBalances = {};
  let calls = [];

  for (const token in fantom_tokens) {
    for (const poolAddress of fantom_tokens[token])
      calls.push({
        target: token,
        params: poolAddress,
      });
  }

  // Pool Balances
  let balanceOfResults = await sdk.api.abi.multiCall({
    block,
    calls: calls,
    abi: "erc20:balanceOf",
    chain: "fantom",
  });

  // Compute Balances
  balanceOfResults.output.forEach((balanceOf) => {
    let address = balanceOf.input.target;
    let amount = balanceOf.output;
    rawBalances[address] = BigNumber(rawBalances[address] || 0)
      .plus(amount)
      .toFixed();
  });

  // NB: Treat both tokens as USDC since prices aren't tracked for Fantom tokens
  // [3:52 AM] 0xngmi: the issue is that atm we don't track price for solana tokens
  // [3:52 AM] 0xngmi: you can just use "usd-coin" and it'll work
  let combinedBalance =
    rawBalances["0x04068DA6C83AFCFA0e13ba15A6696662335D5B75"] / 1e6 +
    rawBalances["0xdc301622e621166BD8E82f2cA0A26c13Ad0BE355"] / 1e18;

  sdk.util.sumSingleBalance(balances, "usd-coin", combinedBalance);

  return balances;
}

async function arbTvl(timestamp, chainBlocks) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [USDC_arb, false],
      [USDT_arb, false],
      [MIM_arb, false],
      [FRAX_arb, false],
      [nUSD_arb, false],
      [USDS_arb, false]
    ],
    poolAddresses_arb,
    chainBlocks["arbitrum"],
    "arbitrum",
  );

  return balances;
}

async function optTvl(timestamp, chainBlocks) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [USDC_opt, false],
      [USDT_opt, false],
      [DAI_opt, false],
      [FRAX_opt, false],
    ],
    poolAddresses_opt,
    chainBlocks["optimism"],
    "optimism",
  );

  return balances;
}

async function evmTvl(timestamp, chainBlocks) {
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [USDC_evm, false],
      [USDT_evm, false],
      [FRAX_evm, false],
    ],
    poolAddresses_evm,
    chainBlocks["evmos"],
    "evmos",
  );

  return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    start: 1611057090, // January 19, 2021 11:51:30 AM
    tvl, // tvl adapter
  },
  fantom: {
    start: 1642723200, // Friday, January 21, 2022 12:00:00 AM UTC
    tvl: tvlFantom,
  },
  arbitrum: {
    tvl: arbTvl,
  },
  optimism: {
    tvl: optTvl,
  },
  evmos: {
    tvl: evmTvl, // Saturday, June 18th, 2022 
  },
  methodology:
    "Counts as TVL all the Assets deposited on each chain through different Pool Contracts",
};
