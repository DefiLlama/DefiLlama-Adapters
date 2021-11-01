const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const erc20 = require("../helper/abis/erc20.json");
const { transformBscAddress } = require("../helper/portedTokens");
const {staking} = require('../helper/staking');
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const stakingContract_eth = "0xD93f98b483CC2F9EFE512696DF8F5deCB73F9497";
const GRO_ETH = "0x09e64c2B61a5f1690Ee6fbeD9baf5D6990F8dFd0"; /* it's not on coingecko yet!! */

const masterChefContract = "0x95fABAe2E9Fb0A269cE307550cAC3093A3cdB448";

const gRootStakingContract_bsc = "0xDA2AE62e2B71ad3000BB75acdA2F8f68DC88aCE4";

const treasuryContract_bsc = "0x392681Eaf8AD9BC65e74BE37Afe7503D92802b7d";
const GRO_BSC = "0x336ed56d8615271b38ecee6f4786b55d0ee91b96";
const gROOT_BSC = "0x8b571fe684133aca1e926beb86cb545e549c832d";
const WBNB_BSC = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

const ignoreAddresses = [
  "0xC8216C4ac63F3cAC4f7e74A82d2252B7658FA8b1",
  "0x87BAde473ea0513D4aA7085484aEAA6cB6EBE7e3",
];

const treasury = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const transformAddress = await transformBscAddress();
  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [GRO_BSC, false],
      [gROOT_BSC, false],
      [WBNB_BSC, false],
    ],
    [treasuryContract_bsc],
    chainBlocks["bsc"],
    "bsc",
    transformAddress
  );

  return balances;
};

//*** Wheat tvl portion as product of GrowthDefi Protocol ***//
const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const poolLength = Number(
    (
      await sdk.api.abi.call({
        abi: abi.poolLength,
        target: masterChefContract,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output
  );

  const allPoolNums = Array.from(Array(poolLength).keys());

  const lpTokens = (
    await sdk.api.abi.multiCall({
      abi: abi.poolInfo,
      calls: allPoolNums.map((idx) => ({
        target: masterChefContract,
        params: idx,
      })),
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.map((lp) => lp.output.lpToken);

  const lpToken_bal = (
    await sdk.api.abi.multiCall({
      abi: erc20.balanceOf,
      calls: lpTokens.map((lp) => ({
        target: lp,
        params: masterChefContract,
      })),
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.map((bal) => bal.output);

  const symbol = (
    await sdk.api.abi.multiCall({
      abi: abi.symbol,
      calls: lpTokens.map((lp) => ({
        target: lp,
      })),
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output;

  const lpPositions = [];
  const stkLpTokens = [];

  symbol.forEach((symbol, idx) => {
    const token = symbol.input.target;
    if (
      ignoreAddresses.some((addr) => addr.toLowerCase() === token.toLowerCase())
    ) {
      return;
    } else if (symbol.output.includes("-LP")) {
      lpPositions.push({
        token: lpTokens[idx],
        balance: lpToken_bal[idx],
      });
    } else if (symbol.output.includes("stk")) {
      stkLpTokens.push({
        token: lpTokens[idx],
      });
    } else {
      sdk.util.sumSingleBalance(
        balances,
        `bsc:${lpTokens[idx]}`,
        lpToken_bal[idx]
      );
    }
  });

  const stakeLpTokens = (
    await sdk.api.abi.multiCall({
      abi: abi.reserveToken,
      calls: stkLpTokens.map((stkLp) => ({
        target: stkLp.token,
      })),
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.map((stkLp) => stkLp.output);

  const stakeLpTokens_bal = (
    await sdk.api.abi.multiCall({
      abi: abi.totalReserve,
      calls: stkLpTokens.map((stkLp) => ({
        target: stkLp.token,
      })),
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.map((stkLp_bal) => stkLp_bal.output);

  const stkSymbol = (
    await sdk.api.abi.multiCall({
      abi: abi.symbol,
      calls: stakeLpTokens.map((lp) => ({
        target: lp,
      })),
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output;

  stkSymbol.forEach((symbol, idx) => {
    if (symbol.output.includes("LP")) {
      lpPositions.push({
        token: stakeLpTokens[idx],
        balance: stakeLpTokens_bal[idx],
      });
    } else {
      sdk.util.sumSingleBalance(
        balances,
        `bsc:${stakeLpTokens[idx]}`,
        stakeLpTokens_bal[idx]
      );
    }
  });

  const transformAddress = await transformBscAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["bsc"],
    "bsc",
    transformAddress
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  staking_eth: {
    tvl: staking(stakingContract_eth, GRO_ETH),
  },
  staking_bsc: {
    tvl: staking(gRootStakingContract_bsc, GRO_BSC, "bsc"),
  },
  treasury_bsc: {
    tvl: treasury,
  },
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
  methodology:
    "We count liquidity on the Wheath, GRoot, Mor as products of Growthdefi Protocol through MasterChef and Staking Contracts",
};
