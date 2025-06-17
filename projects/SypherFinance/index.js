const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require('../helper/staking')

const main_contract = '0xa77BaD7300d954BF9fad8d583ECd3E85a62b8CC0'

const token = '0x5dd2750f18Da3e5933a20340B0fa10cef56A8B07'
const sToken = '0x5Fa631D20B685Aff98aCF4EaAACe28cDbd86f3D3'

module.exports = {
  base: {
    tvl: async (api) => {
      const pools = await api.call({ target: main_contract, abi: "function getAllPools() public view returns(address[] memory list)" })
      const tokens = await api.multiCall({ abi: "function getPoolTokens(address _pool) public view returns(address[] memory list)", target: main_contract, calls: pools })
      return sumTokens2({ api, ownerTokens: tokens.map((v, i) => [v, pools[i]]), })
    },
    staking: staking(sToken, token)
  }
}
