const sdk = require("@defillama/sdk");
const abi = require("./zenlink/abis/getReserves.json");
const { getPrices } = require("./helper/utils.js");
const { unwrapUniswapLPs } = require("./helper/unwrapLPs");

// node test.js projects/sheesha.js
async function tokenPrice(chainBlocks) {
  const [reserves, response] = await Promise.all([
    sdk.api.abi.call({
      abi,
      target: "0xb31ecb43645eb273210838e710f2692cc6b30a11",
      block: chainBlocks.bsc,
      chain: "bsc",
    }),
    getPrices([{ key: "binancecoin" }]),
  ]);

  return (
    (response.data.binancecoin.usd * reserves.output[1]) / reserves.output[0]
  );
}
async function staking(timestamp, ethBlock, chainBlocks) {
  const balances = {};

  const [stakingBalance, price] = await Promise.all([
    sdk.api.abi.call({
      abi: "erc20:balanceOf",
      target: "0x232fb065d9d24c34708eedbf03724f2e95abe768",
      params: "0xC77CfF4cE3E4c3CB57420C1488874988463Fe4a4",
      block: chainBlocks.bsc,
      chain: "bsc",
    }),
    tokenPrice(chainBlocks),
  ]);

  sdk.util.sumSingleBalance(
    balances,
    "usd-coin",
    (stakingBalance.output * price) / 10 ** 18
  );

  return balances;
}

async function pool2(timestamp, block, chainBlocks) {
  const balances = {};

  const [stakingBalance, price] = await Promise.all([
    sdk.api.abi.call({
      abi: "erc20:balanceOf",
      target: "0xB31Ecb43645EB273210838e710f2692CC6b30a11",
      params: "0x5d350F07c1D9245c1Ecb7c622c67EDD49c6a0A35",
      block: chainBlocks.bsc,
      chain: "bsc",
    }),
    tokenPrice(chainBlocks),
  ]);

  await unwrapUniswapLPs(
    balances,
    [
      {
        balance: stakingBalance.output,
        token: "0xB31Ecb43645EB273210838e710f2692CC6b30a11",
      },
    ],
    chainBlocks.bsc,
    "bsc",
    (a) => `bsc:${a}`
  );

  sdk.util.sumSingleBalance(
    balances,
    "usd-coin",
    (balances["bsc:0x232fb065d9d24c34708eedbf03724f2e95abe768"] * price) /
      10 ** 18
  );
  delete balances["bsc:0x232fb065d9d24c34708eedbf03724f2e95abe768"];

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: () => ({}),
    pool2,
    staking,
  },
};
