const { getConfig } = require("../helper/cache");
const { function_view } = require("../helper/chain/aptos");

const thalaswapLensAddress = "ff1ac437457a839f7d07212d789b85dd77b3df00f59613fcba02388464bfcacb";

async function getPool(lensAddress, lptAddress) {
  const args = [lptAddress];
  const fn = () => function_view({ functionStr: `${lensAddress}::lens::get_pool_info`, args});

  let lastError;
  for (let i = 0; i < 3; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await new Promise(res => setTimeout(res, 200));
    }
  }

  return null;
}

const tvl = async (api) => {
  const { data: poolsData } = await getConfig('thalaswa-v2', 'https://app.thala.fi/api/liquidity-pools');
  const v2Pools = poolsData.filter(pool => pool.metadata.isV2)

  for (const v2Pool of v2Pools) {
    const poolInfo = await getPool(thalaswapLensAddress, v2Pool.metadata.lptAddress)
    if (!poolInfo) continue;
    const assets = poolInfo.assets_metadata.map(asset => asset.inner)
    if (!assets) continue
    const balances = poolInfo.balances
    api.add(assets, balances)
  }
}

module.exports = {
  timetravel: false,
  methodology: "Aggregates TVL in all pools in Thalaswap, Thala Labs' AMM.",
  aptos: { tvl }
}