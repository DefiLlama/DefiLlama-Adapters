const { getTokenSupply } = require("../helper/chain/sui")
const { getTvlOfSupplyAssets } = require("../matrixdock/getTvlOfSupplyAssets")

const config = {
  ethereum: ['0x123ffe0a3C62878dcbee2742227dc8990058d9E1'],
}

module.exports = getTvlOfSupplyAssets(config)

module.exports.sui = {
  tvl: async (api) => {
    const token = '0x64bddec0f898ccaa022b8a6e0a5f75d80f53177b87a9795dd15aefe9ac12ee6c::xagm::XAGM'
    const res = await getTokenSupply(token)
    api.add(token, res.supply)
  }
}
