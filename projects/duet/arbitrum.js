const proPoolABI = require("./abis/pro-pool.json");
const PRO_POOL_CONTRACT = "0xdE57c591de8B3675C43fB955725b62e742b1c0B4";

async function fetch(api) {
  const proPoolTvl = await api.call({ abi: proPoolABI.liquidity, target: PRO_POOL_CONTRACT })
  return { 'usd-coin': proPoolTvl / 1e18 };
}

module.exports = fetch;
