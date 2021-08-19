const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformBscAddress } = require("../helper/portedTokens");
const { transformPolygonAddress } = require("../helper/portedTokens");

/* Certain portion of TVL accounted by their site is coming from their own native token
 * in differente blockchains (i.e, bsc and polygon). Aprox $6.0M
 */

const VAULTS_CONTRACTS_BSC = [
  // BANANA-BNB LP
  "0x5f7faeFC9606FfE8B519DDC2Acf3A12e5767a7EE",
  // BANANA-BUSD LP
  "0x858CD232B2236da873f8F72518a6deD3eBa7F1aF",
  // BUSD-BNB LP
  "0xd0177E5Bde32765d1493D80f9b343a4E52010F5D",
  // BUSD-USDC LP
  "0xdc8b4ABB0053e8443b964fb4c0680b55E21ca87d",
  // ETH-BNB LP
  "0x542618f90F2CA668D12d53b50B5008C2b3Acece7",
  // ADA-BNB LP
  "0x6708b15e3b845768712bc78a182c76fdc30b8421",
  // BANANA-BUSD LP
  "0x9d82Bb1983409bf79E599019F948EC36A3Bb05aD",
  // BANANA-BNB LP
  "0xAd1E51D935D6d25B6483F6846b5bbBc1e20df3ef",
  // BUSD-BNB LP
  "0xe927c82E2Ec5C2e045D58145854B8Fad48a3283A",
  // BUSD-USDC LP
  "0xEAbbE6225F82655032ff049dfA461785a1965543",
  // ETH-BNB LP
  "0x9a9d0374E05589C3F0b5C27B32119800a2e295cA",
];

const BANANA_VAULT = "0xB8FDa49A709E9D00274053D9Ed34CCa1B4BB21f8";

const VAULTS_CONTRACTS_POLYGON = [
  // pSPACE-WETH LP
  "0x0be6e19528B77bAAc180dFc72dc1Afa2b09dD860",
  // MATIC-BANANA LP
  "0xCAb27557316B4CF1950872d54Cf853646e70B19D",
  // MATIC-WETH LP
  "0xCF1AC4Aac55DA77854479c4069F7Fb25F290A93f",
  // MATIC-DAI LP
  "0xb2ce974aF77A8EcDF8f9E8BACF1A43f733D040FF",
  // MATIC-BNB LP
  "0x6F402Ce7Fd7d86946B6bc682341b9E4E225d3991",
];

const calcTvl = async (balances, chain, block, vaultContract) => {
  const stakingToken = (
    await sdk.api.abi.multiCall({
      abi: abi.stakingToken,
      calls: vaultContract.map((vcb) => ({
        target: vcb,
      })),
      block,
      ...((chain == "bsc" || chain == "polygon") && { chain }),
    })
  ).output.map((st) => st.output);

  const balance = (
    await sdk.api.abi.multiCall({
      abi: abi.balance,
      calls: vaultContract.map((vcb) => ({
        target: vcb,
      })),
      block,
      ...((chain == "bsc" || chain == "polygon") && { chain }),
    })
  ).output.map((bal) => bal.output);

  const lpPositions = [];
  
  for (let index = 0; index < stakingToken.length; index++) {
    lpPositions.push({
      token: stakingToken[index],
      balance: balance[index],
    });
  }

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    chain == "bsc"
      ? await transformBscAddress()
      : await transformPolygonAddress()
  );
};

const bscTvl = async (timestamp, block, chainBlocks) => {
  const balances = {};

  await calcTvl(balances, "bsc", chainBlocks["bsc"], VAULTS_CONTRACTS_BSC);

  const stakingTokenBanana = (
    await sdk.api.abi.call({
      abi: abi.stakingToken,
      target: BANANA_VAULT,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output;

  const balanceBanana = (
    await sdk.api.abi.call({
      abi: abi.balance,
      target: BANANA_VAULT,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output;

  sdk.util.sumSingleBalance(
    balances,
    `bsc:${stakingTokenBanana}`,
    balanceBanana
  );

  return balances;
};

const polygonTvl = async (timestamp, block, chainBlocks) => {
  const balances = {};

  await calcTvl(
    balances,
    "polygon",
    chainBlocks["polygon"],
    VAULTS_CONTRACTS_POLYGON
  );

  return balances;
};

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl, polygonTvl]),
};
