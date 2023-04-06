const sdk = require("@defillama/sdk");
const proPoolABI = require("./abis/pro-pool.json");
const BigNumber = require("bignumber.js");
const PRO_POOL_CONTRACT = "0xdE57c591de8B3675C43fB955725b62e742b1c0B4";

async function fetch() {

  try {
    const proPoolTvl = await sdk.api.abi.call({
      abi: proPoolABI.liquidity, chain: "arbitrum", target: PRO_POOL_CONTRACT, params: []
    });
    const tvl = new BigNumber(proPoolTvl.output).div(Math.pow(10, 18));
    return { usd: tvl.toNumber() };
  } catch (e) {
    // console.error("arbitrum", e);
    return { usd: 0 };
  }
}

module.exports = fetch;
