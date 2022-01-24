const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const erc20 = require("../helper/abis/erc20.json");
const { transformBscAddress } = require("../helper/portedTokens");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const farmContract = "0x1aF28E7b1A03fA107961897a28449F4F9768ac75";
const bankContract = "0x99dD1c7a2893931D209fA5C57FE65f34d4C11db8";
const LEAF = "0x1cbddf83de068464eba3a4e319bd3197a7eea12c";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

const bscTvl = async (chainBlocks) => {
  const balances = {};

  const getAllFarms = (
    await sdk.api.abi.call({
      abi: abi.getAllFarms,
      target: farmContract,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output
    .map((tuple) => tuple)
    .map((st) => st.stakeToken);

  const farmBalance = (
    await sdk.api.abi.multiCall({
      abi: erc20.balanceOf,
      calls: getAllFarms.map((f) => ({
        target: f,
        params: farmContract,
      })),
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.map((bal) => bal.output);

  const symbols = (
    await sdk.api.abi.multiCall({
      abi: abi.symbol,
      calls: getAllFarms.map((f) => ({
        target: f,
      })),
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.map((symbol) => symbol.output);

  const getIBPrice = (
    await sdk.api.abi.call({
      abi: abi.getIBPrice,
      target: bankContract,
      params: LEAF,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.ibPriceWithPrecision;

  const getNativeIBPrice = (
    await sdk.api.abi.call({
      abi: abi.getNativeIBPrice,
      target: bankContract,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output.ibPriceWithPrecision;

  const lpPositions = [];

  symbols.forEach((symbol, farmId) => {
    if (symbol.includes("LP")) {
      lpPositions.push({
        token: getAllFarms[farmId],
        balance: farmBalance[farmId],
      });
    } else if (symbol.includes("TREE")) {
      const treeBal = (farmBalance[farmId] * 1000).toLocaleString("fullwide", {
        useGrouping: false,
      });

      sdk.util.sumSingleBalance(balances, `bsc:${LEAF}`, treeBal);
    } else if (symbol.includes("sdLEAF")) {
      const sdLEAFBal = (
        (farmBalance[farmId] * getIBPrice) /
        10 ** 18
      ).toLocaleString("fullwide", {
        useGrouping: false,
      });

      sdk.util.sumSingleBalance(balances, `bsc:${LEAF}`, sdLEAFBal);
    } else {
      const sdBNBBal = (
        (farmBalance[farmId] * getNativeIBPrice) /
        10 ** 18
      ).toLocaleString("fullwide", {
        useGrouping: false,
      });

      sdk.util.sumSingleBalance(balances, `bsc:${WBNB}`, sdBNBBal);
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
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
  methodology:
    "We count liquidity on the Farms through Farm Contract",
};
