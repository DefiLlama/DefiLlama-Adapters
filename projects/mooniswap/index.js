const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");

const factoryContract = "0x71CD6666064C3A1354a3B4dca5fA1E2D3ee7D303";

const ethTvl = async () => {
  const balances = {};

  const getAllpools = (
    await sdk.api.abi.call({
      abi: abi.getAllPools,
      target: factoryContract,
    })
  ).output;

  for (const pool of getAllpools) {
    const getTokens = (
      await sdk.api.abi.call({
        abi: abi.getTokens,
        target: pool,
      })
    ).output;

    const getBalance = (
      await sdk.api.abi.multiCall({
        abi: erc20.balanceOf,
        calls: getTokens.map((token) => ({
          target: token,
          params: pool,
        })),
      })
    ).output.map((bal) => bal.output);

    getTokens.forEach((token, idx) => {
      if (getBalance[idx] === null) {
        return;
      } else {
        sdk.util.sumSingleBalance(balances, token, getBalance[idx]);
      }
    });
  }

  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  ethereum: {
    tvl: ethTvl,
  },
  methodology: "Counts tvl on all AMM Pools through Factory Contract",
};
