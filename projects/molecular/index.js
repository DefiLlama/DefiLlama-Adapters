const { sumTokens2 } = require("../helper/unwrapLPs")

const POOL_AGGREGATOR_ADDRESS = "0xF4C39ee884b3304CdB35abd256Df95Eb2F5e795B"
const POOL_COLLATERAL_MANAGER = "0xF4C39ee884b3304CdB35abd256Df95Eb2F5e795B"
async function tvl(api){
    let pools = await api.call({
        abi:ABI.getPoolTotalTvl,
        target:POOL_AGGREGATOR_ADDRESS,
    })
    pools.forEach(({ assets, tvl }) => { api.add(assets, tvl) })
    let tokensAndOwners = pools.map(pool=>[pool.assets,POOL_COLLATERAL_MANAGER])
    return sumTokens2({ api ,resolveLP:true,tokensAndOwners});
}

module.exports = {
    arbitrum: { tvl }
  };

const ABI = {
    getPoolTotalTvl:"function getPoolTotalTvl() view returns (tuple(uint256 pid, address assets, uint256 tvl)[])"
}