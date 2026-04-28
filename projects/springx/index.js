const { sumTokens2 } = require("../helper/unwrapLPs")

const FARM_ADDRESS = "0xafF15Ca201C08F05f65d4d0A9d9C368C8356f796"
async function tvl(api){
    let pools = await api.call({abi:ABI.getPoolTotalTvl,target:FARM_ADDRESS,})
    pools.forEach(({ assets, tvl }) => { api.add(assets, tvl) })
    return sumTokens2({ api, resolveLP: true })
}

module.exports = {
    plasma: { tvl }
  };

const ABI = {
    getPoolTotalTvl:"function getPoolTotalTvl() view returns (tuple(uint256 pid, address assets, uint256 tvl)[])"
}