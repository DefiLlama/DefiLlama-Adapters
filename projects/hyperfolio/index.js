const { sumTokens2 } = require("../helper/unwrapLPs")

const FARM_ADDRESS = "0x210Ce7DCB6a068152163D41CD48c9936B29BAb96"
async function tvl(api){
    const pools = await api.call({abi:ABI.getPoolTotalTvl,target:FARM_ADDRESS,})
    pools.forEach(({ assets, tvl }) => { api.add(assets, tvl) })
    return sumTokens2({ api, resolveLP: true })
}


module.exports = {
    hyperliquid:{tvl}
  };

const ABI = {
    getPoolTotalTvl:"function getPoolTotalTvl() view returns (tuple(uint256 pid, address assets, uint256 tvl)[])"
}