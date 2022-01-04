const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformBscAddress } = require("../helper/portedTokens");

/* There are another two Hives within the protocol
 *  but uniquely their own token is deposited, accounting at current price for ~$3.3M
 */

const SINGLE_ASSET_FARMS = [
  "0xb7D43F1beD47eCba4Ad69CcD56dde4474B599965",
  "0xAD4134F59C5241d0B4f6189731AA2f7b279D4104",
  "0xc212ba7Dec34308A4cb380612830263387150310",
  "0xBcCfD3e2Af166bB28B6b4Dfd6C1BF1F3f7F47632",
  "0xe763D7E9a14ADB928766C19DF4bcE580fb6393B3",
];

const LP_FARMS = [
  "0xdFe440fBe839E9D722F3d1c28773850F99692c76",
  "0x6c7eFFa3d0694f8fc2D6aEe501ff484c1FE6fcD2",
  "0x65003459BF2506B096a9a9C8bC691e88430567D1",
  "0x12180BB36DdBce325b3be0c087d61Fce39b8f5A4",
  "0xD87F461a52E2eB9E57463B9A4E0e97c7026A5DCB",
  "0x31972E7bfAaeE72F2EB3a7F68Ff71D0C61162e81",
  "0x3B34AA6825fA731c69C63d4925d7a2E3F6c7f13C",
];

const HIVE_BNB_HUNNY = "0x434Af79fd4E96B5985719e3F5f766619DC185EAe";

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  // --- Balances of single side farms ---
  const balancesSingles = (
    await sdk.api.abi.multiCall({
      abi: abi.balance,
      calls: SINGLE_ASSET_FARMS.map((address) => ({ target: address })),
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.map((el) => el.output);

  const stakingTokensSingles = (
    await sdk.api.abi.multiCall({
      abi: abi.stakingToken,
      calls: SINGLE_ASSET_FARMS.map((address) => ({ target: address })),
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.map((el) => el.output);

  balancesSingles.forEach((bal, idx) => {
    sdk.util.sumSingleBalance(
      balances,
      `bsc:${stakingTokensSingles[idx]}`,
      bal
    );
  });

  // --- Balances of LPs farms ---
  const balancesLps = (
    await sdk.api.abi.multiCall({
      abi: abi.balance,
      calls: LP_FARMS.map((address) => ({ target: address })),
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.map((el) => el.output);

  const stakingTokensLps = (
    await sdk.api.abi.multiCall({
      abi: abi.stakingToken,
      calls: LP_FARMS.map((address) => ({ target: address })),
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.map((el) => el.output);

  const lpPositions = [];

  balancesLps.forEach((balance, idx) => {
    lpPositions.push({
      token: stakingTokensLps[idx],
      balance,
    });
  });

  // --- Balances of Hive (HUNNY-BNB) ---
  const hiveBalance = (
    await sdk.api.abi.call({
      abi: abi.balance,
      target: HIVE_BNB_HUNNY,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output;

  const tokenInHive = (
    await sdk.api.abi.call({
      abi: abi.token,
      target: HIVE_BNB_HUNNY,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output;

  lpPositions.push({
    token: tokenInHive,
    balance: hiveBalance,
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
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
};
