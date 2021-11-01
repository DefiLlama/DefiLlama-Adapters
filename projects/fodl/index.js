const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs.js");  

const sushiLps = [
  "0xa5c475167f03b1556c054e0da78192cd2779087f", // FODL USDC
  "0xce7e98d4da6ebda6af474ea618c6b175729cd366", // FODL-WETH
];

async function ethPool2(timestamp, block) {
  let balances = {};

  let { output: totalSupply } = await sdk.api.abi.multiCall({
    calls: sushiLps.map(address => ({
      target: address
    })),
    abi: "erc20:totalSupply",
    block
  });

  let lpPos = totalSupply.map(result => ({
    balance: result.output,
    token: result.input.target
  }));

  await unwrapUniswapLPs(balances, lpPos, block);

  return balances;  
}

module.exports = {
  methodology: "Pool2 TVL are the tokens locked in the SUSHI pools",
  ethereum: {
    tvl: async () => ({}),
    pool2: ethPool2,
  },
  tvl: async () => ({}),
};
