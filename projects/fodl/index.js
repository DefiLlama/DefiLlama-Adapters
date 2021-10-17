const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const sushiLps = [
  "0xa5c475167f03b1556c054e0da78192cd2779087f", // FODL USDC
  "0xce7e98d4da6ebda6af474ea618c6b175729cd366", // FODL-WETH
];

async function ethPool2(timestamp, block) {
  let balances = {};

  for (let i = 0; i < sushiLps.length; i++) {
    let { output: token0 } = await sdk.api.abi.call({
      target: sushiLps[i],
      abi: abi["token0"],
      block,
    });

    let { output: token1 } = await sdk.api.abi.call({
      target: sushiLps[i],
      abi: abi["token1"],
      block,
    });

    let { output: reserves } = await sdk.api.abi.call({
      target: sushiLps[i],
      abi: abi["getReserves"],
      block,
    });

    sdk.util.sumSingleBalance(balances, token0, reserves._reserve0);
    sdk.util.sumSingleBalance(balances, token1, reserves._reserve1);
  }
  return balances;
}

module.exports = {
  ethereum: {
    tvl: async () => ({}),
    pool2: ethPool2,
  },
  tvl: async () => ({}),
};
