const sdk = require("@defillama/sdk");
const getPoolInfo = require("./getPoolInfo.json");

const chain = 'polygon'
const FACTORY_ADDRESS = "0xcE214f6a877747495106B5e55533f3e23D290DBd"

const tokens = Object.values({
  POLYGON_WMATIC: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
  POLYGON_WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  POLYGON_WBTC: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
  POLYGON_USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  POLYGON_USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  POLYGON_DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  POLYGON_XEN: "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e",
})

async function tvl(_, _b, {[chain]: block}) {
  const balances = {}
  const transform = i => `${chain}:${i}`
  const { output } = await sdk.api.abi.multiCall({
    target: FACTORY_ADDRESS,
    abi: getPoolInfo,
    calls: tokens.map(i => ({ params: [i]})),
    chain, block,
  })
  output.forEach(({ output }, i) => {
    sdk.util.sumSingleBalance(balances, transform(tokens[i]), output.freeAmount)
    sdk.util.sumSingleBalance(balances, transform(tokens[i]), output.frozenAmount)
  })
  return balances
}

module.exports = {
  polygon: {
    tvl,
  },
};
