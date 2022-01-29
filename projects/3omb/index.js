const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformFantomAddress } = require("../helper/portedTokens");

const ThreeOmbGenesisPoolsContract =
  "0xcB0b0419E6a1F46Be89C1c1eeeAf9172b7125b29";

const fntmTvl = async (chainBlocks) => {
  const balances = {};

  const lpPositions = [];
  let poolInfoReturn = "";
  i = 0;
  do {
    try {
      const token = (
        await sdk.api.abi.call({
          abi: abi.poolInfo,
          target: ThreeOmbGenesisPoolsContract,
          params: i,
          chain: "fantom",
          block: chainBlocks["fantom"],
        })
      ).output.token;

      const getTokenBalance = (
        await sdk.api.abi.call({
          abi: erc20.balanceOf,
          target: token,
          params: ThreeOmbGenesisPoolsContract,
          chain: "fantom",
          block: chainBlocks["fantom"],
        })
      ).output;

      const getTokenSymbol = (
        await sdk.api.abi.call({
          abi: abi.symbol,
          target: token,
          chain: "fantom",
          block: chainBlocks["fantom"],
        })
      ).output;

      if (getTokenSymbol.includes("LP")) {
        lpPositions.push({
          token: token,
          balance: getTokenBalance,
        });
      } else {
        sdk.util.sumSingleBalance(balances, `fantom:${token}`, getTokenBalance);
      }
    } catch (error) {
      poolInfoReturn = error.reason;
    }
    i += 1;
  } while (poolInfoReturn != "missing revert data in call exception");

  const transformAddress = await transformFantomAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["fantom"],
    "fantom",
    transformAddress
  );

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  fantom: {
    tvl: fntmTvl,
  },
  methodology:
    "Counts liquidity on all the 3Farms through ThreeOmbGenesisPools Contract",
};
