const { sumTokens2 } = require("../helper/unwrapLPs");

const AGGREGATOR = "0x6bD057Dae9aA5aE05c782F2eB988CBdE53Be9620";


async function tvl(api) {
    let pools = await api.call({ abi: abiInfo.poolTvls, target: AGGREGATOR });
    pools.forEach(pool=>{
        api.add(pool.poolAssets,pool.tvl)
    })
    return await sumTokens2({api,resolveLP:true})
}


module.exports = {
doublecounted: true,
  linea: {
    tvl,
  },
};

const abiInfo = {
  poolTvls:
    "function getPoolTotalTvl() view returns (tuple(uint256 pid, address poolAddress,address poolAssets, uint256 tvl)[])",
};
