const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs.js");

const ctxToken = "0x321c2fe4446c7c963dc41dd58879af648838f98d";
const factory = "0x70236b36f86AB4bd557Fe9934E1246537B472918";

const pool2 = [
  "0xa87e2c5d5964955242989b954474ff2eb08dd2f5", // TCAP-WETH
  "0x2a93167ed63a31f35ca4788e2eb9fbd9fa6089d0", // CTX-WETH
];

async function tvl(timestamp, block) {
  let balances = {};

  const results = await sdk.api.abi.multiCall({
    block,
    abi: "erc20:balanceOf",
    calls: [
      {
        target: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        params: ["0x717170b66654292dfbd89c39f5ae6753d2ac1381"],
      },
      {
        target: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        params: ["0x443366a7a5821619d8d57405511e4fadd9964771"],
      },
    ],
  });
  sdk.util.sumMultiBalanceOf(balances, results);

  return balances;
}

async function pool2Tvl(timestamp, block) {
  let balances = {};

  let { output: totalSupply } = await sdk.api.abi.multiCall({
    calls: pool2.map((address) => ({ target: address })),
    abi: "erc20:totalSupply",
    block,
  });

  for (let i = 0; i < totalSupply.length; i++) {
    await unwrapUniswapLPs(
      balances,
      [{ balance: totalSupply[i].output, token: pool2[i] }],
      block,
      "ethereum",
      (addr) => addr,
      []
    );
  }

  return balances;
}

async function stakingTvl(timestamp, block) {
  let balances = {};

  let { output: balance } = await sdk.api.erc20.balanceOf({
    target: ctxToken,
    owner: factory,
    block,
  });

  sdk.util.sumSingleBalance(balances, ctxToken, balance);

  return balances;
}

module.exports = {
  ethereum: {
    tvl: tvl,
    pool2: pool2Tvl,
    staking: stakingTvl,
  },
  tvl,
};
