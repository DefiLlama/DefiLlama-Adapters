const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");
const getPoolInfo = require("./getPoolInfo.json");

const FACTORY_ADDRESS = "0xcE214f6a877747495106B5e55533f3e23D290DBd";

const POLYGON_WMATIC = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
const POLYGON_WETH = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
const POLYGON_WBTC = "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6";
const POLYGON_USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
const POLYGON_USDT = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const POLYGON_DAI = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
const POLYGON_XEN = "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e";

function getPoolTvl(TOKEN_ADDRESS, chain) {
  return async (_, _ethBlock, chainBlocks) => {
    const poolInfo = (
      await sdk.api.abi.call({
        target: FACTORY_ADDRESS,
        abi: getPoolInfo,
        params: [TOKEN_ADDRESS],
        block: chainBlocks[chain],
        chain: chain,
      })
    ).output;

    const balance = new BigNumber(poolInfo[0]).plus(new BigNumber(poolInfo[1]));

    return {
      [`${chain}:${TOKEN_ADDRESS}`]: balance.toNumber(),
    };
  };
}

module.exports = {
  polygon: {
    tvl: sdk.util.sumChainTvls([
      getPoolTvl(POLYGON_WMATIC, "polygon"),
      getPoolTvl(POLYGON_WBTC, "polygon"),
      getPoolTvl(POLYGON_WETH, "polygon"),
      getPoolTvl(POLYGON_USDC, "polygon"),
      getPoolTvl(POLYGON_USDT, "polygon"),
      getPoolTvl(POLYGON_DAI, "polygon"),
      getPoolTvl(POLYGON_XEN, "polygon"),
    ]),
  },
};
