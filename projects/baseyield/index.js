const { yieldHelper } = require("../helper/unknownTokens");

const MiniChefV2 = "0x3db771B933aC5d824a2411866F1a395DbB026528";
const tokenAPI = "address:want"

const abis = {
  lpToken: 'function lpToken(uint256) public view returns (address)',
  poolLength: 'function poolLength() public view returns (uint256)',
}

module.exports = {
  base: {
    tvl: async (_, _b, _c, { api }) => {
      const vaults = await api.fetchList({ target: MiniChefV2, lengthAbi: abis.poolLength, itemAbi: abis.lpToken, })
      return yieldHelper({ ...api, vaults, tokenAPI });
    }
  }
}
