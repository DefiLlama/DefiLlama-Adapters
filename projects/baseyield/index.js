const { sumTokens2 } = require('../helper/unwrapLPs')
const MiniChefV2 = "0x3db771B933aC5d824a2411866F1a395DbB026528";

const abis = {
  lpToken: 'function lpToken(uint256) public view returns (address)',
  poolLength: 'function poolLength() public view returns (uint256)',
}

module.exports = {
  base: {
    tvl: async (api) => {
      const vaults = await api.fetchList({ target: MiniChefV2, lengthAbi: abis.poolLength, itemAbi: abis.lpToken, })
      const tokens = await api.multiCall({ abi: 'address:want', calls: vaults })
      const bals = await api.multiCall({ abi: 'uint256:balance', calls: vaults })
      tokens.forEach((token, i) => {
        if (token.toLowerCase() === '0xf45116c2e5be608152ea8a6a73917dfe75b707dc') return;
        api.add(token, bals[i])
      })
      return sumTokens2({ api, resolveLP: true })
    }
  }
}
